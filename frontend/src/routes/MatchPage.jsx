import React, { useEffect, useState, useRef } from 'react';
import './MatchPage.css';

function MatchPage() {

  const intervalIdRef = useRef(null);

  const [topics, setTopics] = useState([]); // State to store the fetched topics
  const [topic, setTopic] = useState("");  // State to store the selected topic
  const [difficulty, setDifficulty] = useState('Easy');
  const [status, setStatus] = useState('Waiting for button to be pressed');

  // Fetch topics from API when the component mounts
  useEffect(() => {
    fetch("http://localhost:8000/topic")
      .then((response) => response.json()) // Parse the JSON response
      .then((data) => {setTopics(data);
        if (data.length > 0) {
          setTopic(data[0]); // Set the first topic as the default selected topic
        }})     // Set topics in state
      .catch((error) => console.error("Error fetching topics:", error));
  }, []);



  const checkStatus = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const user_id = user.user_id;
    fetch(`http://localhost:8002/matches/${user_id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setStatus(data);
      })
      .catch(error => {
        console.log(error.message);
      });
  };


  const handleMatchClick = () => {
    setStatus('Matching...difficulty:'+difficulty+"; topic:"+topic);
    // Simulate a delay for matching (e.g., API call)
    const url = new URL('http://localhost:8002/match');
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
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        intervalIdRef.current = setInterval(checkStatus, 5000);
        return response.json(); // Assuming the server returns JSON
      })
      .then(data => {
        setStatus(data.message); // Handle the response data
        
        console.log('Success:', data); // Log success
      })
      .catch(error => {
        setStatus('Match not found!');
        console.error('Error:', error); // Handle any errors
      });


  };

  return (
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
        <button className="match-button" onClick={handleMatchClick}>
          Start Match
        </button>
      </div>

      <div className="status-display">
        {status}
      </div>
    </div>
  );
}

export default MatchPage;
