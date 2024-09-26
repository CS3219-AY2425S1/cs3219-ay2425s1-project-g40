import React, { useState, useEffect } from 'react';
import './QuestionPage.css'; 

const QuestionPage = () => {

  const apiurl = "http://127.0.0.1:8000/question/"


  // Fetch all questions on component mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Fetch questions from the API
  const fetchQuestions = async () => {
    try {
      const response = await fetch(apiurl, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();

        // Transform the response object into an array
        const arrayData = Object.values(data); // Use data, not jsonData

        // Update the questions with the array data
        updateQuestions(arrayData);
        
        // // Loop through each question and set its data
        // arrayData.forEach(question => {
        //   setQuestionData({
        //     difficulty: question.difficulty,
        //     topic: question.topic,
        //     title: question.title,
        //     description: question.description,
        //     titleSlug: question.titleSlug,
        //   });

        //   console.log(question);
        // });
        
      } else {
        alert('Failed to fetch questions.');
        updateQuestions([]); // Set to an empty array if the request fails
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      updateQuestions([]); // Set to an empty array in case of error
    }
  };


  // //REMOVE THIS BEFORE SUBMITTING
  // const [titleSlug] = useState('test-question');


  // State for questions and the current question data
   const [questions, updateQuestions] = useState([]);
   const [selectedQuestion, setSelectedQuestion] = useState(null);
   const [mode, setMode] = useState("create"); //Either create or edit mode.


  // Consolidated state for question data
  const [questionData, setQuestionData] = useState({
    difficulty: 'easy',
    topic: 'loops',
    title: 'Some_Title',
    description: '',
    titleSlug: 'test-question' // Static value; consider changing if needed
  });


  const handleTitleClick = (question) => {
    setSelectedQuestion(question);
    setMode("create");
    setQuestionData({
      ...questionData,
      title: "Some_Title",
    });
    clearState();
  };
  
  const handleDelete = async () => {
    try {
      const response = await fetch(`${apiurl}${selectedQuestion.titleSlug}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        // Remove the deleted question from the list
        updateQuestions(questions.filter((question) => question.titleSlug !== selectedQuestion.titleSlug));
        setSelectedQuestion(null);
        alert('Question deleted successfully!');
      } else {
        alert('Failed to delete the question.');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handleEdit = () => {
    if (selectedQuestion) {
      setMode("edit");
      setQuestionData({
        difficulty: selectedQuestion.difficulty,
        topic: selectedQuestion.topic,
        title: selectedQuestion.title,
        description: selectedQuestion.description,
        titleSlug: selectedQuestion.titleSlug,
      });
    }
  };
  
  
  const clearState = async () => {
    //   //THIS IS FOR TESTING THE API!!!!!!!
    //   const response = await fetch('http://127.0.0.1:8000/question/', {
    //     method: 'GET', // Explicitly specifying the GET method
    // });
    //               if (response.ok) {
    //                 const data = await response.json();
    //               alert(JSON.stringify(data)); 
    //               }
    //               else{alert("gg")}
    //           */    

    setQuestionData({
      difficulty: "easy",
      topic: "loops",
      title: "Some_Title",
      description: "",
      titleSlug: "test-question",
    });
    setMode("create");
  }

  // Handle API call on button press
  const handleSetQuestion = async () => {
    const data = {
      ...questionData,
    };

    if (mode === "create") {
      try {
        const response = await fetch(apiurl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const newQuestion = await response.json();
          updateQuestions(prevQuestions => [...prevQuestions, newQuestion]);
          setSelectedQuestion(newQuestion);
          alert('Question submitted successfully!');
          clearState(); // Clear the state after submitting
        } else {
          alert('Failed to submit question. Make sure questions are not duplicates. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while submitting the question. Error: ' + error);
      }
    } else {
      try {
        const response = await fetch(`${apiurl}${questionData.titleSlug}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const updatedQuestion = await response.json();
          updateQuestions(prevQuestions => 
            prevQuestions.map(question => 
              question.titleSlug === updatedQuestion.titleSlug ? updatedQuestion : question
            )
          );
          setSelectedQuestion(updatedQuestion);
          alert('Question updated successfully!');
          clearState();
        } else {
          alert('Failed to submit question. Make sure questions are not duplicates. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while submitting the question. Error: ' + error);
      }
    }
  };

  return (
    <div className="question-page-container">
      <div className="left-section pr-4 overflow-y-auto" style={{ width: '45%' }}>
        <h1 className="text-2xl font-bold mb-4">Question Repository</h1>
        <table className="min-w-full table-fixed bg-white border border-gray-300 rounded-lg overflow-hidden shadow-lg">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-2 px-4 border-b w-1/2">Question Title</th>
              <th className="py-2 px-4 border-b w-1/4">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question, index) => (
              <tr
                key={question.titleSlug}
                className={`${
                  index % 2 === 0 ? 'bg-blue-50' : 'bg-white'
                } hover:bg-blue-100 cursor-pointer transition duration-300`}
                onClick={() => handleTitleClick(question)}
              >
                <td className="py-2 px-4 border-b">{question.title}</td>
                <td className="py-2 px-4 border-b">{question.difficulty}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Display selected question's description and delete button */}
        <div className="mt-4">
          {selectedQuestion ? (
            <div className="p-4 border border-gray-300 rounded-lg shadow-lg bg-white">
              <h2 className="font-bold text-xl">{selectedQuestion.title} - Description</h2>
              <p className="mt-2 text-gray-700">{selectedQuestion.description}</p>
              
              <div className="mt-4 flex justify-between">
                {/* Delete Button */}
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={handleDelete}
                >
                  Delete Question
                </button>

                {/* Edit Button */}
                <button
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 ml-auto"
                  onClick={handleEdit}
                >
                  Edit Question
                </button>
              </div>

            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select a question to see the description.</p>
            </div>
          )}
        </div>
      </div>

      <div className="right-section" style={{ width: '55%' }}>
        <div className="info-row" id="curmode">
          Mode: {mode === "create" ? "Creating new question" : `Editing question: ${selectedQuestion.title}`}
        </div>

        <div className="row">
          <label htmlFor="difficulty">Difficulty:</label>
          <select 
            id="difficulty" 
            className="dropdown" 
            value={questionData.difficulty}
            onChange={(e) => setQuestionData({ ...questionData, difficulty: e.target.value })}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <label htmlFor="topic">Topic:</label>
          <select 
            id="topic" 
            className="dropdown"
            value={questionData.topic}
            onChange={(e) => setQuestionData({ ...questionData, topic: e.target.value })}
          >
            <option value="loops">Loops</option>
            <option value="arrays">Arrays</option>
            <option value="conditions">Conditions</option>
          </select>
        </div>

        <div className="title-section">
          <label htmlFor="title">Title:</label>
          <textarea
            id="title"
            className="questionarea"
            value={mode === 'edit' ? selectedQuestion.title : questionData.title}
            onChange={(e) => setQuestionData({ ...questionData, title: e.target.value })}
            readOnly={mode === 'edit'} // Make the textarea read-only if in edit mode
          />
        </div>

        <div className="question-section">
          <label htmlFor="question">Question:</label>
          <textarea
            id="question"
            className="textarea"
            value={questionData.description}
            onChange={(e) => setQuestionData({ ...questionData, description: e.target.value })}
          />
        </div>

        <div className="button-section">
          <div className="button-box">
            <button className="clear-question-button" onClick={clearState}>Clear/Exit</button>
          </div>

          <div className="button-box-right" onClick={handleSetQuestion}>
            <button className="set-question-button">
              {mode === "create" ? "Submit Question" : "Update Question"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;