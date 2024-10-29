import { python } from '@codemirror/lang-python';
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror, { basicSetup } from "@uiw/react-codemirror";
import React, { useEffect, useRef, useState, useMemo} from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { getDocument, peerExtension } from '../collab/collabExtension';
import { socket } from '../collab/socket';
import Navbar from '../component/navigation/NavBar';
import './CollabPage.css';
import ReactMarkdown from 'react-markdown';

const CLEAR_INTERPRETER = `
globals().clear()
`

// Output console component to render the output separately
const OutputConsole = ({ output }) => (
    <div className="terminal">
        <div className="command-line">
            <h3>Output:</h3>
            <pre>{output}</pre>
        </div>
    </div>
);

function CollabPage() {
    const user = JSON.parse(localStorage.getItem('user'));
    const { room_token } = useParams();
    const [output, setOutput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [version, setVersion] = useState(null);
    const codeRef = useRef('');
    const outputRef = useRef(''); // Ref to store output without causing re-renders
    const pyodideRef = useRef(null);
    const editorRef = useRef(null); // Ref to the CodeMirror instance

    useEffect(() => {
        socket.connect();
        const fetchData = async () => {
            const { version, doc } = await getDocument(socket, room_token);
            setVersion(version);
            codeRef.current = doc.toString(); // Store initial code in ref
        };
        
        fetchData();
    
        const handleConnect = () => {
            setIsConnected(true);
            if (user && user.id) {
                socket.emit('joinRoom', room_token, user.id);
            } else {
                console.error('User ID is missing!');
            }
            
          }

        const handlePeerJoined = (userId) => {
            toast.info(`User ${userId} has joined the room!`);
        };

        const handlePeerDisconnected = () => {
            toast.info(`The other user has left the room!`);
        };
    
        socket.on('connect', handleConnect);
        socket.on('joinedRoom', handlePeerJoined);
        socket.on('userDisconnected', handlePeerDisconnected);
        socket.on('connect_error', (err) => {
            console.error('Connection Error:', err);
            toast.error('Connection failed!');
        });
        

        return () => {
            socket.off('connect', handleConnect);
            socket.off('joinedRoom', handlePeerJoined);
            socket.off('userDisconnected', handlePeerDisconnected);
        };
    }, [room_token]);

    useEffect(() => {
        const loadPyodide = async () => {
            const pyodideInstance = await window.loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.2/full/',
                stdout: (text) => appendOutput(text),
                stderr: (text) => appendOutput(`Error: ${text}`)
            });
            pyodideRef.current = pyodideInstance;
        };
    
        loadPyodide();
    }, []);

    const handleCodeChange = (newCode) => {
        // Update the codeRef every time the editor changes
        codeRef.current = newCode;
    };

    const runCode = async () => {
        const pyodide = pyodideRef.current;

        if (pyodide) {
            // Clear previous output
            outputRef.current = ''; // Update the ref
            setOutput(''); // Clear the UI output
            try {
                const result = await pyodide.runPythonAsync(CLEAR_INTERPRETER + codeRef.current);
                if (result) {
                    appendOutput(result);
                }
            } catch (error) {
                appendOutput(`Error: ${error}`);
            }
        } else {
            toast.error("Pyodide is not loaded yet!");
        }
    };

      const appendOutput = (newOutput) => {
        outputRef.current += newOutput;
        setOutput(outputRef.current); // Immediately update the UI
      };
      
    // Memoize the extensions for CodeMirror to avoid unnecessary recomputations
    const extensions = useMemo(() => [
        basicSetup(),
        python(),
        peerExtension(version, socket, room_token, user.id)
    ], [version, room_token, user.id]);

    return (
        <>
            <Navbar />
            <div className="editor-container">
                <div>
                    <div className="markdown-container">
                        {isConnected ? <ReactMarkdown>{localStorage.getItem("questiondata")}</ReactMarkdown> : <p>Not connected</p>}
                    </div>

                    <div className="editor-section">
                        {codeRef.current !== null && version !== null ? (
                            <CodeMirror
                                ref={editorRef} // Assign ref to the editor
                                value={codeRef.current}
                                theme={vscodeDark}
                                extensions={extensions}
                                onChange={handleCodeChange}
                                className="codeMirrorStyle"
                            />
                        ) : (
                            <p>Loading</p>
                        )}
                        <div className="run-button-container">
                            <button onClick={runCode} className="run-button">Run Code</button>
                        </div>
                    </div>

                    <div className="terminal-container">
                        <OutputConsole output={output} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default CollabPage;
