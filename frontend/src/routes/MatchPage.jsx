import React, { useEffect, useState } from 'react';
import './MatchPage.css';

function MatchPage() {

  const [topics, setTopics] = useState([]); // State to store the fetched topics
  const [topic, setTopic] = useState("");  // State to store the selected topic
  const [difficulty, setDifficulty] = useState('easy');
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

  const handleMatchClick = () => {
    setStatus('Matching...difficulty:'+difficulty+"; topic:"+topic);
    // Simulate a delay for matching (e.g., API call)
    const url = new URL('http://localhost:8000/match');
    const user = JSON.parse(localStorage.getItem('user'));
    const payload = {
      topic: topic,
      difficulty: difficulty,
      user: user ? user.id : null // Add user ID if user is not null
    };
    alert(user.id)

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
        return response.json(); // Assuming the server returns JSON
      })
      .then(data => {
        setStatus(data); // Handle the response data
        console.log('Success:', data); // Log success
      })
      .catch(error => {
        console.error('Error:', error); // Handle any errors
      });

    setTimeout(() => {
      setStatus('Match not found!');
    }, 2000);
  };

  return (
    <div className="match-container">
      <div className="diff">
        <div className="form-group">
          <label>Difficulty:</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
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
