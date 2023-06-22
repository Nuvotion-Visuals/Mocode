import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Symbols } from "../components/Symbols";
import styled from "styled-components";

// Dynamic import MonacoEditor to avoid SSR issues
const MonacoEditor = dynamic(import("react-monaco-editor"), { ssr: false });

export const Code = ({ type, callback }: { type: string, callback: (val: string) => void }) => {
  const [currentCode, setCurrentCode] = useState<string>(() => {
    const storedCode = localStorage.getItem(type);
    try {
      return storedCode ? JSON.parse(storedCode) : "<div></div>";
    } catch (error) {
      console.error("Error parsing stored code:", error);
      return "<div></div>";
    }
  });

  useEffect(() => {
    localStorage.setItem(type, JSON.stringify(currentCode));
    callback(currentCode);
  }, [currentCode, type]);

  const insertSymbol = (symbol: string) => {
    setCurrentCode((prevCode) => prevCode + symbol);
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
            editorDidMount={() => {
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
            theme="vs-dark"
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

