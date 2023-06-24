import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { UnControlled as CodeMirror } from 'react-codemirror2';
import { Editor } from 'codemirror';

import { Symbols } from "./Symbols";

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
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/selection/active-line';

export const Code = ({ type, value, callback }: { type: string, value: string, callback: (val: string) => void }) => {
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

  const handleChange = (editor: any, data: any, value: string) => {
    callback(value);
  };

  useEffect(() => {
    // check if the editor instance is available and the new value is not same as the current value in the editor to avoid infinite loop
    if (editorInstance && editorInstance.getValue() !== value) {
      editorInstance.setValue(value);
    }
  }, [value, editorInstance]); // dependencies of the effect

  const codeMirrorOptions = {
    lineNumbers: true,
    mode: type === 'html' ? 'htmlmixed' : type,
    theme: 'pastel-on-dark',
    autoCloseTags: { whenClosing: true, whenOpening: true, indentTags: [], emptyTags: [] },
    extraKeys: { 'Ctrl-Space': 'autocomplete' }, // Enable code completion with Ctrl+Space
    autoRefresh: true
  };

  const insertSymbol = (str: string) => {
    if (editorInstance) {
      const doc = editorInstance.getDoc();
      const cursor = doc.getCursor();
      doc.replaceRange(str, cursor);
      const newCursor = { line: cursor.line, ch: cursor.ch + str.length };
      doc.setCursor(newCursor); // Set the new cursor position
      editorInstance.focus(); // Focus the editor
    }
  }

  const selectAllText = () => {
    if (editorInstance) {
      const doc = editorInstance.getDoc();
      doc.setSelection({ line: 0, ch: 0 }, { line: doc.lineCount(), ch: 0 });
      editorInstance.focus(); // Focus the editor
    }
  };

  const undo = () => {
    if (editorInstance) {
      editorInstance.undo();
    }
  };

  const redo = () => {
    if (editorInstance) {
      editorInstance.redo();
    }
  };

  
  return (<>
    <Symbols insertSymbol={(symbol: string) => insertSymbol(symbol)} />
    <S.Code>
      <CodeMirror
        options={codeMirrorOptions}
        onChange={handleChange}
        editorDidMount={editor => {
          setEditorInstance(editor);
          // editor.setValue(value);
          // setCurrentCode(currentCode);
        }}
      />
     
    </S.Code>
    <S.Sticky>
      <S.Button onClick={undo}>
        Undo
      </S.Button>
      <S.Button onClick={redo}>
        Redo
      </S.Button>
      <S.Button onClick={selectAllText}>
        Select all
      </S.Button>
    </S.Sticky>
   
  </>
   
  );
};

const S = {
  Code: styled.div`
    width: 100%;
    position: relative;
    .CodeMirror {
      height: 100% !important;
    }
  `,
  Sticky: styled.div`
    position: sticky;
    display: flex;
    justify-content: right;
    gap: 2px;
    bottom: .5rem;
    margin-left: 100%;
    right: 0;
  `,
  Button: styled.button`
    background: black;
    border: none;
    border-radius: .25rem;
    color: #828282;
    height: 32px;
    padding: 0 .75rem;
    flex-shrink: 0;
  `
};
