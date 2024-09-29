import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Panel, PanelGroup } from "react-resizable-panels";
import { toast } from 'react-toastify';
import CreateQuestionModal from '../component/question/CreateQuestionModal';
import EditQuestionModal from '../component/question/EditQuestionModal';
import Pill from '../ui/Pill';
import './QuestionPage.css';

function capitalize(s)
{
    return s && s[0].toUpperCase() + s.slice(1);
}

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
      }
    } catch (error) {
      toast.error('Something went wrong. Failed to fetch questions')
      updateQuestions([]); // Set to an empty array in case of error
    }
  };

  // State for questions and the current question data
  const [questions, updateQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const handleTitleClick = (question) => {
    setSelectedQuestion(question);
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
        toast.success('Question deleted successfully!');
      } else {
        toast.error('Failed to delete the question.');
      }
    } catch (error) {
      toast.error('Error deleting question:', error);
    }
  };

  const handleEditQuestion = async (editedQuestion) => {
    try {
      const response = await fetch(`${apiurl}${editedQuestion.titleSlug}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedQuestion),
      });

      if (response.ok) {
        const updatedQuestion = await response.json();
        updateQuestions(prevQuestions => 
          prevQuestions.map(question => 
            question.titleSlug === updatedQuestion.titleSlug ? updatedQuestion : question
          )
        );
        setSelectedQuestion(updatedQuestion);
        toast.success('Question updated successfully!');
        return
      } else if (response.status === 400) {
        toast.error("No duplicate question titles allowed!");
        return
      } else if (response.status === 422) {
        const response_text = await response.text();
        const text_data = JSON.parse(response_text);
        if (text_data.errors) {
          text_data.errors.forEach(error => {
            toast.error(capitalize(error.loc) + ": " + error.msg);
          });
        }
        return
      }
      else if (response.status === 404) {
        toast.error("Cannot ”find the question you are trying to edit")
        return;
      }
    } catch (error) {
      toast.error('An error occurred while submitting the question. Error: ' + error);
    }
  }
  // Handle API call on button press
  const handleCreateQuestion = async (newQuestion) => {
      try {
        const response = await fetch(apiurl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newQuestion),
        });

        if (response.ok) {
          const newQuestion = await response.json();
          updateQuestions(prevQuestions => [...prevQuestions, newQuestion]);
          setSelectedQuestion(newQuestion);
          toast.success('Question submitted successfully!');
          return;
        } else if (response.status === 400) {
          toast.error("No duplicate question titles allowed!");
          return;
        } else {
          const response_text = await response.text();
          const text_data = JSON.parse(response_text);
          if (text_data.errors) {
            text_data.errors.forEach(error => {
              toast.error(capitalize(error.loc) + ": " + error.msg);
            });
          }
          return;
        }
      } catch (error) {
        toast.error('An error occurred while submitting the question. Error: ' + error);
      }
  };

  return (
    <div className="question-page-container">
      <h1 className="text-3xl font-bold mb-4">Question Repository</h1>
      <div className='justify-end ml-auto m-2 space-x-2'>
        <CreateQuestionModal createQuestionHandler={handleCreateQuestion} />
        {selectedQuestion && <EditQuestionModal selectedQuestion={selectedQuestion} editQuestionHandler={handleEditQuestion} />}
      </div>
      <PanelGroup direction="horizontal" className='z-0'>
        <>  
          <Panel id="questions" order={1} className='m-1'>
            <div className='flex flex-col overflow-auto h-96 rounded-xl will-change-transform z-0 relative'>
              <table className="min-w-full table-fixed bg-white border border-gray-300 rounded-xl">
                <thead className='bg-blue-200 text-slate-900 sticky top-0 '>
                  <tr className='text-left'>
                    <th className="py-2 px-4 border-b w-1/2">Question Title</th>
                    <th className="py-2 px-4 border-b w-1/4">Difficulty</th>
                    <th className="py-2 px-4 border-b w-1/4">Topic</th>
                  </tr>
                </thead>
                <tbody className='h-96 overflow-y-auto'>
                  {questions.map((question, index) => (
                    <tr
                      key={question.titleSlug}
                      className={`${
                        index % 2 === 0 ? 'bg-blue-50/50' : 'bg-white'
                      } hover:bg-blue-100 cursor-pointer transition duration-300`}
                      onClick={() => handleTitleClick(question)}
                    >
                      <td className="py-2 px-4 border-b font-semibold">{question.title}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <Pill type={question.difficulty} data={question.difficulty} />
                      </td>
                      <td className="py-2 px-4 border-b">
                        <Pill type="topic" data={question.topic} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
        

        {/* Display selected question's description and delete button */}
        {selectedQuestion && (
          <>
            <Panel id="details" order={2} className='m-1 h-full' style={{overflowY: "scroll", overflowX: "auto"}}>
            <div className="sticky top-0 flex w-full justify-between gap-x-1 bg-white/95 p-3 shadow-sm rounded-t-xl border align-middle">
                <button 
                  className='bg-zinc-200 hover:bg-zinc-400 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-900 border'
                  onClick={() => setSelectedQuestion(null)}>
                    Hide
                  </button>
                {/* Delete Button */}
                <div className='ml-auto space-x-1'>
                  <button
                    className="bg-zinc-200 hover:bg-red-600 text-sm text-red-500 px-4 py-2 rounded-2xl  font-semibold
                    hover:text-white"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>

            </div>
            <div className="h-fit p-4 border border-gray-300 rounded-b-xl bg-white overflow-auto">
              <div className='m-1 mb-5 space-x-1'>
                <h1 className="font-bold text-2xl">{selectedQuestion.title}</h1>
                <Pill type={selectedQuestion.difficulty} data={selectedQuestion.difficulty} />
                <Pill type={"topic"} data={selectedQuestion.topic} />
              </div>
              <hr />
              {/* Render the question description as Markdown */}
              <ReactMarkdown className="mt-5 text-gray-700">
                {selectedQuestion.description}
              </ReactMarkdown>
            </div>
            </Panel>
          </>
        )
        }
        </PanelGroup>
    </div>
  );
};

export default QuestionPage;
