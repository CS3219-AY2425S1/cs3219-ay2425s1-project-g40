import React, { useEffect, useRef, useState } from 'react';
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { python } from '@codemirror/lang-python'; 
// import { loadPyodide } from 'pyodide';
import { toast } from 'react-toastify';
import Navbar from '../component/navigation/NavBar';
import './CollabPage.css';

function CollabPage() {


    const [pyodide, setPyodide] = useState(null);
    const [output, setOutput] = useState('');
    const [code, setCode] = useState("print('Hello World!')");


    // Load Pyodide when component mounts
    useEffect(() => {
        const loadPyodide = async () => {
            const pyodideInstance = await window.loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.2/full/',
                stdout: (text) => setOutput(prevOutput => prevOutput + text), // Append stdout output
                stderr: (text) => setOutput(prevOutput => prevOutput + `Error: ${text}`) // Append stderr output
            });
            setPyodide(pyodideInstance);
        };

        loadPyodide();
    }, []);

    const runCode = () => {
        if (pyodide) {
            // Clear previous output
            setOutput('');
            try {
                const result = pyodide.runPython(code); // Run Python code
                if (result) {
                    setOutput(prevOutput => prevOutput + result); // Append result if there is one
                }
            } catch (error) {
                setOutput(prevOutput => prevOutput + `Error: ${error}`); // Handle runtime errors
            }
        } else {
            toast.error("Pyodide is not loaded yet!");
        }
    };


    return (
        <>
            <Navbar />
                <div className="editor-container">
                    <div>
                        <div className="headerStyle">Let's Collaborate!</div>
                        
                        <div className="editor-section">
                            <CodeMirror
                                value={code}
                                onChange={(value) => setCode(value)}  // Update code on change
                                theme={vscodeDark}
                                extensions={[python()]}
                                className="codeMirrorStyle"
                            />
                            <div className="run-button-container">
                                <button onClick={runCode} className="run-button">Run Code</button>
                            </div>
                        </div>

                        <div className="terminal-container">
                            <div className="terminal">
                                <div className="command-line">
                                <h3>Output:</h3>
                                <pre>{output}</pre>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

        </>
    );
}

export default CollabPage;