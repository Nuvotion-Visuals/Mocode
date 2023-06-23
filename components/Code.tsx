import React, { useState, useEffect } from "react";
import { UnControlled as CodeMirror } from 'react-codemirror2';
import styled from "styled-components";

// Import the required CodeMirror modes and addons
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/html-hint';
import 'codemirror/addon/hint/css-hint';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/hint/show-hint.css';

export const Code = ({ type, callback }: { type: string, callback: (val: string) => void }) => {
  const [currentCode, setCurrentCode] = useState<string>(() => {
    const storedCode = localStorage.getItem(type);
    try {
      return storedCode ? JSON.parse(storedCode) : "";
    } catch (error) {
      console.error("Error parsing stored code:", error);
      return "";
    }
  });

  useEffect(() => {
    localStorage.setItem(type, JSON.stringify(currentCode));
    callback(currentCode);
  }, [currentCode, type]);

  const handleChange = (editor: any, data: any, value: string) => {
    setCurrentCode(value);
  };

  const codeMirrorOptions = {
    lineNumbers: true,
    mode: type === 'html' ? 'htmlmixed' : type,
    theme: 'pastel-on-dark',
    autoCloseTags: true, // Enable auto-closing of HTML tags
    extraKeys: { 'Ctrl-Space': 'autocomplete' }, // Enable code completion with Ctrl+Space
  };

  return (
    <S.Code>
      {typeof window !== "undefined" && (
        <S.EditorContainer>
          <CodeMirror
            value={currentCode}
            options={codeMirrorOptions}
            onChange={handleChange}
          
          />
        </S.EditorContainer>
      )}
    </S.Code>
  );
};

const S = {
  Code: styled.div`
    /* Your Styles */
    display: flex;
    flex-direction: column;
    /* height: 100vh; Adjust based on your layout */

    .CodeMirror {
  height: 100vh !important;
}

  `,
  EditorContainer: styled.div`
    flex-grow: 1;
  `
};
