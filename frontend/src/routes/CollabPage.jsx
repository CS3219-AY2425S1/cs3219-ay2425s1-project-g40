import React, { useEffect, useRef, useState } from 'react';
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { python } from '@codemirror/lang-python'; 
import { toast } from 'react-toastify';
import Navbar from '../component/navigation/NavBar';
import './CollabPage.css';

function CollabPage() {


  const code = "print('Code Mirror!')";
  return (
    <>
    <Navbar />
    <div className="editor-container">
    <div>
        <div className="headerStyle">
        Let's Collaborate!
        </div>
        <CodeMirror
        value={code}
        theme={vscodeDark}
        extensions={[python()]}
        className="codeMirrorStyle"
        />
    </div>
    </div>
    </>
  );
}

export default CollabPage;