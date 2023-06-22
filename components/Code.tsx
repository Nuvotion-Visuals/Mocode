import { useState, useEffect } from "react"
import { Symbols }  from '../components/Symbols'

import Editor from 'react-simple-code-editor';
// @ts-ignore
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import styled from "styled-components";

export const Code = ({ type, callback}: {
  type: string,
  callback: (val: string) => void
}) => {
  const [currentCode, setCurrentCode] = useState<string>(
    JSON.parse(localStorage.getItem(type) || '') || ''
  );

  useEffect(() => {
    localStorage.setItem(type, JSON.stringify(currentCode));
    callback(currentCode);
  }, [currentCode, type]);

  const insertSymbol = (symbol: string) => {
    const el = document.querySelector(`#${type} textarea`) as HTMLTextAreaElement;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    setCurrentCode(before + symbol + after);
    el.selectionStart = el.selectionEnd = start + symbol.length;
    el.focus();
  };

   const renderEditor = () => {
    switch(type) {
      case 'html':
        return (
          <Editor
            id='html'
            className='editor'
            padding={8}
            value={currentCode}
            onValueChange={code => setCurrentCode(code)}
            highlight={code => highlight(code, languages.markup)}
          />
        )
      case 'css':
        return (
          <Editor
            id='css'
            className='editor'
            padding={8}
            value={currentCode}
            onValueChange={code => setCurrentCode(code)}
            highlight={code => highlight(code, languages.css)}
          />
        )
      case 'js':
        return (
          <Editor
            id='js'
            className='editor'
            padding={8}
            value={currentCode}
            onValueChange={code => setCurrentCode(code)}
            highlight={code => highlight(code, languages.javascript)}
          />
        )
    }
  }

    return <S.Code>
      <Symbols className='symbols' insertSymbol={insertSymbol} />

    { renderEditor() }
    
    </S.Code>
}

const S = {
  Code: styled.div`
  /* display: block;
  width: 100%;
  height: 300px;
  overflow: auto;
  margin-top: 52px; */

.symbols {
  position: absolute;
  top: 48px;
}

.editor {
  
  /* min-height: 100%; */
  font-size: 18px;
}

/* Syntax highlighting */
.token.comment {
  color: #608b4e;
}
.token.prolog,
.token.doctype,
.token.cdata {
  color: #90a4ae;
}
.token.punctuation {
  color: #569cd6;
}
.namespace {
  opacity: 0.7;
}
.token.property {
  color: #9cdcfe;
}
.token.tag {
  color: #b5cea8;
}
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.deleted {
  color: #b5cea8;
}
.token.selector {
  color: #d7ba7d;
}
.token.attr-name {
  color: #9cdcfe;
}
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #ce9178;
}

.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: #ce9178;
}
.token.atrule,
.token.attr-value {
  color: #ce9178;
}
.token.keyword {
  color: #569cd6;
}
.token.function {
  color: #9cdcfe;
}
.token.regex,
.token.important,
.token.variable {
  color: #569cd6;
}
.token.important,
.token.bold {
  font-weight: bold;
}
.token.italic {
  font-style: italic;
}
.token.entity {
  cursor: help;
}
  `
}