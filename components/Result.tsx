import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface ResultProps {
  html: string;
  css: string;
  js: string;
}

export const Result: React.FC<ResultProps> = ({ html, css, js }) => {
  const iframe = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframe.current) {
      const getGeneratedPageURL = ({ html, css, js }: ResultProps) => {
        const getBlobURL = (code: string, type: string) => {
          const blob = new Blob([code], { type });
          return URL.createObjectURL(blob);
        };

        const cssURL = getBlobURL(css, 'text/css');
        const jsURL = getBlobURL(js, 'text/javascript');

        const source = `
          <html>
            <head>
              ${css && `<link rel="stylesheet" type="text/css" href="${cssURL}" />`}
            </head>
            <body>
              ${html || ''}
              ${js && `<script src="${jsURL}"></script>`}
            </body>
          </html>
        `;

        return getBlobURL(source, 'text/html');
      };

      const url = getGeneratedPageURL({ html, css, js });

      iframe.current.src = url;

      iframe.current.addEventListener('load', () => {
        const contentWindow = iframe.current?.contentWindow;
        if (contentWindow) {
          contentWindow.onerror = () => {
            // handle error
            console.log('error');
          };
        }
      });
    }
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
    color: white;
    width: 100%;
    height: 500px;

    iframe {
      border: none;
      display: flex;
      flex-grow: 1;
      width: 100%;
      height: 100%;
      background: white;
    }
  `,
};

export default Result;
