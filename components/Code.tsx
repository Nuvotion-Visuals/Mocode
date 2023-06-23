import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Symbols } from "../components/Symbols";
import styled from "styled-components";
import { editor as monacoEditor } from 'monaco-editor';

const MonacoEditor = dynamic(import("react-monaco-editor"), { ssr: false });

export const Code = ({ type, callback }: { type: string, callback: (val: string) => void }) => {
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);
  
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

  const insertSymbol = (symbol: string) => {
    const editor = editorRef.current;
    if (editor) {
      const position = editor.getPosition();
      const model = editor.getModel();
      if (position && model) {
        const offset = model.getOffsetAt(position);
        const text = model.getValue();
        const newContent = text.slice(0, offset) + symbol + text.slice(offset);
        model.setValue(newContent);
        const newPosition = model.getPositionAt(offset + symbol.length);
        if (newPosition) {
          editor.setPosition(newPosition);
        }
        editor.focus();
      }
    }
  };
  
  const handleChange = (value: string) => {
    setCurrentCode(value);
  };

  return (
    <S.Code>
      <Symbols className="symbols" insertSymbol={insertSymbol} />
      {typeof window !== "undefined" && (
        <S.EditorContainer>
          <MonacoEditor
            editorDidMount={(editor, monaco) => {
              editorRef.current = editor;

              fetch('/brilliance-black.json')
                .then(data => data.json())
                .then(data => {
                  monaco.editor.defineTheme('brilliance-black', data);
                  monaco.editor.setTheme('brilliance-black');
                })

              monaco.languages.registerCompletionItemProvider('html', 
                {
                  triggerCharacters: ['>'],
                  provideCompletionItems: (model, position) => 
                  {
                    const codePre: string = model.getValueInRange({
                      startLineNumber: position.lineNumber,
                      startColumn: 1,
                      endLineNumber: position.lineNumber,
                      endColumn: position.column,
                    });
                
                    const tag = codePre.match(/.*<(\w+)>$/)?.[1];
                
                    if (!tag) {
                      return;
                    }
                    
                    const word = model.getWordUntilPosition(position);
                
                    return {
                      suggestions: [
                        {
                          label: `</${tag}>`,
                          kind: monaco.languages.CompletionItemKind.EnumMember,
                          insertText: `$1</${tag}>`,
                          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                          range:  {
                              startLineNumber: position.lineNumber,
                              endLineNumber: position.lineNumber,
                              startColumn: word.startColumn,
                              endColumn: word.endColumn,
                          },
                        },
                      ],
                    };
                  },
                }
              );

              // @ts-ignore
              window.MonacoEnvironment.getWorkerUrl = (
                _moduleId: string,
                label: string
              ) => {
                if (label === "json")
                  return "_next/static/json.worker.js";
                if (label === "css")
                  return "_next/static/css.worker.js";
                if (label === "html")
                  return "_next/static/html.worker.js";
                if (
                  label === "typescript" ||
                  label === "javascript"
                )
                  return "_next/static/ts.worker.js";
                return "_next/static/editor.worker.js";
              };
            }}
            language={type}
            theme="hc-black"
            value={currentCode}
            options={{
              minimap: {
                enabled: false
              },
              automaticLayout: true,
              autoClosingBrackets: "always",
              suggestOnTriggerCharacters: true,
            }}
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
    height: 100vh; /* Adjust based on your layout */
  `,
  EditorContainer: styled.div`
    flex-grow: 1;
  `
};

