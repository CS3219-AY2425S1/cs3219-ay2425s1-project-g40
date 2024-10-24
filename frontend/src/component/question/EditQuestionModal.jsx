import React, { useEffect, useState } from "react";

export default function EditQuestionModal({ selectedQuestion, editQuestionHandler }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setSelectedQuestion] = useState(selectedQuestion)
  useEffect(() => {
    setSelectedQuestion(selectedQuestion);
  }, [selectedQuestion]);
  return (
    <>
      <button
        className="bg-blue-500 text-white font-semibold text-sm px-4 py-2 rounded-2xl hover:bg-blue-600"
        onClick={() => setIsOpen(true)}
      >
        Edit Question
      </button>
      {isOpen ? (
        <div className="backdrop-blur-lg justify-center items-center flex overflow-x-clip overflow-y-clip fixed inset-0 z-50 outline-none focus:outline-none">
          <div className="relative w-auto my-6 mx-auto max-w-6xl m-6 max-h-full">
            <div className="border rounded-xl shadow-md relative flex flex-col w-full outline-none focus:outline-none bg-white">
              
              {/* header */}
              <div className="flex items-start p-5 justify-between rounded-t-xl">
                <h3 className="text-2xl font-semibold">Edit question</h3>
                <button 
                    className='bg-zinc-200 hover:bg-zinc-400 rounded-full text-xs font-semibold text-slate-900 border'
                    onClick={() => setIsOpen(false)}>
                      X
                </button>
              </div>
              <hr />

              {/* body */}
              <div className="relative pt-3 px-6 flex-auto">
                <EditQuestionForm questionData={question} setQuestionData={setSelectedQuestion} />
              </div>

              {/* footer */}
              <div className="flex items-center justify-end px-6 py-3 rounded-b-xl space-x-3">
                  <button
                    className="bg-zinc-200 hover:bg-red-600 text-sm text-red-500 px-4 py-2 rounded-2xl  font-semibold
                    hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-500 text-white font-semibold text-sm px-4 py-2 rounded-2xl hover:bg-blue-600"
                    onClick={() => {editQuestionHandler(question)}}
                  >
                    Save
                  </button>
              </div>
            </div>
          </div>
        </div>
      ): null}
    </>
  )
}

function EditQuestionForm({ questionData, setQuestionData }) {
  return (
    <div className="flex flex-col space-y-3">
      <div className="w-full">
        <label htmlFor="title" className="text-slate-900 font-bold mb-2">
          {questionData.title}
        </label>
      </div>

    <div className="w-full flex flex-row space-x-4 justify-between align-middle">
      <div className="w-1/2">
          <label htmlFor="difficulty" className="text-slate-900 font-semibold mb-2 text-sm">
            Difficulty
          </label>
          <select 
            id="difficulty" 
            className="border rounded-full w-full py-2 px-3 focus:outline-blue-500 font-semibold mb-1 text-xs" 
            value={questionData.difficulty}
            onChange={(e) => setQuestionData({ ...questionData, difficulty: e.target.value })}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
        </select>
      </div>

      <div className="w-1/2">
        <label htmlFor="topic" className="text-slate-900 font-semibold mb-2 text-sm">
          Topic
        </label>
        <input
          id="topic" 
          className="border rounded-full w-full py-2 px-3 focus:outline-blue-500 font-semibold mb-1 text-xs"
          value={questionData.topic}
          placeholder="e.g Array"
          onChange={(e) => setQuestionData({ ...questionData, topic: e.target.value })}
        />
      </div>
    </div>


      <div className="w-full">
        <label
          htmlFor="question"
          className="text-slate-900 font-semibold mb-1 text-sm"
        >
          Description
        </label>
        <p
          className="text-slate-500 italic text-sm px-3"
        >
          Enter your question in Markdown format
        </p>
        <textarea
          id="question"
          value={questionData.description}
          className="border rounded-xl w-[640px] h-[300px] py-2 px-3 focus:outline-blue-500 m-1 text-sm font-mono" 
          onChange={(e) => setQuestionData({...questionData, description: e.target.value })}
        />
      </div>
    </div>
  )
}