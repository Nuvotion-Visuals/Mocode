import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface ResultProps {
  html: string;
  css: string;
  js: string;
  onError: (error: string) => void;
}

export const Result: React.FC<ResultProps> = ({ html, css, js, onError }) => {
  const iframe = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const getGeneratedPageURL = ({ html, css, js }: any) => {
      const getBlobURL = (code: string, type: string) => {
        const blob = new Blob([code], { type });
        return URL.createObjectURL(blob);
      };
    
      const cssURL = getBlobURL(css, 'text/css');
      const jsURL = getBlobURL(`
        try {
          ${js}
        } catch (error) {
          window.parent.postMessage({
            type: 'ERROR',
            message: error.message,
            stack: error.stack
          }, '*');
        }
      `, 'text/javascript');
    
      const source = `
        <html>
          <head>
            <style>
            
            </style>
            <link rel="stylesheet" type="text/css" href="${cssURL}" />
          </head>
          <body>
            ${html}
            <script src="${jsURL}"></script>
          </body>
        </html>
      `;
    
      return getBlobURL(source, 'text/html');
    };
    

    const url = getGeneratedPageURL({ html, css, js });

    iframe.current!.src = url;

    const handleMessage = function(event: MessageEvent) {
      let color;
      let messageType = event.data.type;
      console.log(messageType)
    
      switch (messageType) {
        case 'INFO':
          color = 'blue';
          break;
        case 'WARN':
          color = 'orange';
          break;
        case 'ERROR':
          color = 'red';
          break;
        case 'DEBUG':
          color = 'green';
          break;
        default:
          color = 'white';
      }
    
      let message = `<span style="color: ${color};">${event.data.message}</span>`;
      
      switch (messageType) {
        case 'INFO':
        case 'WARN':
        case 'ERROR':
        case 'DEBUG':
          onError(message);
          break;
        default:
      }
    };
    

    window.addEventListener('message', handleMessage);
    
    return () => window.removeEventListener('message', handleMessage);
  }, [html, css, js]);

  return (
    <S.Result>
      <iframe ref={iframe} id="iframe" />
    </S.Result>
  );
};

const S = {
  Result: styled.div`
    display: block;
    color: black;
    width: 100%;
    height: 100%;

    iframe {
      border: none;
      display: flex;
      flex-grow: 1;
      width: 100%;
      height: 100%;
      background: black;
      color: white;
    }
  `,
};

export default Result;
