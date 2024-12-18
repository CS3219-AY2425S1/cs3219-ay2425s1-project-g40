import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../component/navigation/NavBar';
import './MatchPage.css';

const topicAPI = process.env.REACT_APP_TOPIC_API_URL ?? "http://localhost:8000/topic"
const matchingServiceAPI = process.env.REACT_APP_MATCHING_SERVICE_URL || "http://localhost:8002" 

function MatchPage() {
  const navigate = useNavigate();

  const intervalIdRef = useRef(null);
  var intervalId = useRef(null);

  const [topics, setTopics] = useState([]); // State to store the fetched topics
  const [topic, setTopic] = useState("");  // State to store the selected topic
  const [difficulty, setDifficulty] = useState('Easy');
  const [status, setStatus] = useState('Waiting for match request');
  const [time, setTime] = useState(0);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status; // Update the ref whenever status changes
  }, [status]);

  // Fetch topics from API when the component mounts
  useEffect(() => {
    fetch(topicAPI)
      .then((response) => response.json()) // Parse the JSON response
      .then((data) => {setTopics(data);
        if (data.length > 0) {
          setTopic(data[0]); // Set the first topic as the default selected topic
        }})     // Set topics in state
      .catch((error) => toast.error("Error fetching topics:", error));
  }, []);



  const checkStatus = (id) => {
    fetch(`${matchingServiceAPI}/matches/${id}`, 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then(response => {
        if (!response.ok) {
          
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if(data.matches !== undefined) {
          setStatus(`${data.matches.user_id} has matched with user: ${data.matches.other_user_id} with topic: ${data.matches.key}`);
          toast.success("Match found!")
          localStorage.setItem("questiondata",data.matches.question.description)
          navigate(`/collab/${data.matches.room_token}`)
          clearInterval(intervalIdRef.current);
          clearInterval(intervalId);
          setTime(0);
          window.location.reload();
        }
      })
      .catch(error => {
        setStatus("Failed to find matches")
        toast.error(error.message);
      });
  };


  const handleMatchClick = () => {
    // Simulate a delay for matching (e.g., API call)
    const url = new URL(`${matchingServiceAPI}/match`);
    const user = JSON.parse(localStorage.getItem('user'));
    const payload = {
      topic: topic,
      difficulty: difficulty,
      user: user ? user.id : null // Add user ID if user is not null
    };

    fetch(url, {
      method: 'POST', // Change method to POST
      headers: {
        'Content-Type': 'application/json' // Indicate that we're sending JSON data
      },
      body: JSON.stringify(payload) // Convert the payload object to a JSON string
    })
      .then(async response => {
        if (response.status === 400) {
          toast.warn("No questions for selected difficulty and topic")
          return;
        }

        if (response.status === 429) {
          const resp = await response.json()
          toast.warn(`Too many match requests. Try again in ${resp.detail}s`)
          return;
        }

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        toast.success("Match request created successfully")
        checkStatus(user.id)
        setStatus("Still finding")
        intervalIdRef.current = setInterval(() => checkStatus(user.id), 2000);
        intervalId = setInterval(() => {
          setTime((prevTime) => prevTime + 1); // Increment time
        }, 1000);
        setTimeout(() => {
          clearInterval(intervalIdRef.current);
          clearInterval(intervalId);
          setTime(0);
          if (statusRef.current === "Still finding") {
            toast.warn("Could not find any match")
            setStatus('Waiting for match request');
          }
        }, 30000);
        return response.json(); // Assuming the server returns JSON
      })
      .then(data => {
        console.log('Success:', data); // Log success
      })
      .catch(error => {
        setStatus('Match not found!');
        console.error(error.message)
        toast.error('Error:', error.message); // Handle any errors
      });


  };

  return (
    <>
    <Navbar />
    <div className="match-container">
      <div className="diff">
        <div className="form-group">
          <label>Difficulty:</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="topic">
        <div className="form-group">
        <label>Topic:</label>
        <select value={topic} id="topicselect" onChange={(e) => setTopic(e.target.value)}>
          {Array.isArray(topics) &&topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>
      </div>

      <div className="start">
        <button
          className="match-button"
          onClick={handleMatchClick}
          disabled={statusRef.current === 'Still finding' && status === "Still finding"}
        >
          Find Match
        </button>
      </div>

      <div className="status-display">
        <p>{status}</p>
        {status === 'Still finding' ? <p>Time elapsed: {time} s</p> : null}
      </div>
    </div>
    </>
  );
}

export default MatchPage;
