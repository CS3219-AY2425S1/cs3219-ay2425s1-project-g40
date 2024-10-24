import { python } from '@codemirror/lang-python';
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror, { basicSetup } from "@uiw/react-codemirror";
import React, { useEffect, useState } from 'react';
// import { loadPyodide } from 'pyodide';
import { toast } from 'react-toastify';
import { getDocument, peerExtension } from '../collab/collabExtension';
import { socket } from '../collab/socket';
import Navbar from '../component/navigation/NavBar';
import './CollabPage.css';

function CollabPage() {
    const user = JSON.parse(localStorage.getItem('user'));
    const [pyodide, setPyodide] = useState(null);
    const [output, setOutput] = useState('');
    const [isConnected, setIsConnected] = useState(false)
    const [version, setVersion] = useState(null);
    const [code, setCode] = useState(null);

    useEffect(() => {
        socket.connect()
        const fetchData = async () => {
          const { version, doc } = await getDocument(socket);
          setVersion(version);
          setCode(doc.toString());
        };
        
        fetchData();
    
        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);
    
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

    
        return () => {
          socket.off('connect', handleConnect);
          socket.off('disconnect', handleDisconnect);
        };
      }, []);

    /**
     * Pyodide doesnt seem to work when i add websockets
     */
    // useEffect(() => {
    //     const loadPyodide = async () => {
    //         const pyodideInstance = await window.loadPyodide({
    //             indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.2/full/',
    //             stdout: (text) => setOutput(prevOutput => prevOutput + text + "\n"), // Add a newline
    //             stderr: (text) => setOutput(prevOutput => prevOutput + `Error: ${text}\n`) // Add a newline for errors
    //         });
    //         setPyodide(pyodideInstance);
    //     };
    
    //     loadPyodide();
    // }, []);

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
                        <div className="headerStyle">Let's Collaborate!
                        {isConnected ? <p>Connected</p> : <p>Not connected</p>}
                        </div>
                        
                        <div className="editor-section">
                            {code !== null && version !== null ?
                                <CodeMirror
                                    value={code}
                                    theme={vscodeDark}
                                    basicSetup={false}
                                    id="codeEditor"
                                    extensions={[
                                        basicSetup(),
                                        python(),
                                        peerExtension(version, socket, user.id)
                                    ]}
                                    className="codeMirrorStyle"
                                /> : (
                                    <p>Loading</p>
                                )
                            }
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