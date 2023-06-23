import React, { useReducer, createContext, useContext, useEffect, FC, Dispatch, ReactNode, useState } from 'react'
import styled from 'styled-components'

import { Result } from '../components/Result'
import { GoldenLayoutComponent } from '@annotationhub/react-golden-layout'
import { Code } from '../components/Code'

// Define types for the state and actions
type CodeState = {
  html: string;
  css: string;
  javascript: string;
  error: string;
}

type CodeAction =
  | { type: 'setHtml', payload: string }
  | { type: 'setCss', payload: string }
  | { type: 'setJs', payload: string }
  | { type: 'setError', payload: string }

// Create a context
const CodeContext = createContext<{ state: CodeState, dispatch: Dispatch<CodeAction> }>({ state: { html: '', css: '', javascript: '', error: '' }, dispatch: () => null });

// Create a reducer to handle actions
const codeReducer = (state: CodeState, action: CodeAction): CodeState => {
  switch (action.type) {
    case 'setHtml':
      return { ...state, html: action.payload };
    case 'setCss':
      return { ...state, css: action.payload };
    case 'setJs':
      return { ...state, javascript: action.payload };
    case 'setError':
      return { ...state, error: `${state.error ? `${state.error}\n` : ''}${action.payload}` };
    default:
      return state;
  }
}

// Create context provider component
const CodeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(codeReducer, { html: '', css: '', javascript: '', error: '' });

  return (
    <CodeContext.Provider value={{ state, dispatch }}>
      {children}
    </CodeContext.Provider>
  )
}

const HtmlCode: FC = () => {
  const { dispatch } = useContext(CodeContext);

  return <Code type='html' callback={payload => dispatch({ type: 'setHtml', payload })} />;
}

const CssCode: FC = () => {
  const { dispatch } = useContext(CodeContext);

  return <Code type='css' callback={payload => dispatch({ type: 'setCss', payload })} />;
}

const JsCode: FC = () => {
  const { dispatch } = useContext(CodeContext);

  return <Code type='javascript' callback={payload => dispatch({ type: 'setJs', payload })} />;
}

const ErrorMessage: FC = () => {
  const { state } = useContext(CodeContext);

  return  <pre>
    {state.error}
  </pre>
}

const ResultComponent: FC = () => {
  const { state, dispatch } = useContext(CodeContext);

  // Effect to re-render this component when state changes
  useEffect(() => {}, [state.html, state.css, state.javascript]);

  return <Result 
    html={state.html} 
    css={state.css} 
    js={state.javascript} 
    onError={payload => {
      dispatch({ type: 'setError', payload })
      console.log('test', payload)
    }}
  />;
}

const Layout = React.memo(() => {
  const [_, setLayoutManager] = useState({})

  return (
    <CodeProvider>
      <S.DockingContainer>
        <GoldenLayoutComponent
            config={{
              settings: {
                showPopoutIcon: false,
                showMaximiseIcon: false,
                showCloseIcon: false,
                hasHeaders: true,
              },
              content: [
                {
                  type: 'column',
                  content: [
                    {
                      type: 'row',
                      content: [
                        {
                          type: 'stack',
                          content: [
                            {
                              component: HtmlCode,
                              title: '🔤 HTML'
                            },
                            {
                              component: CssCode,
                              title: '🎨 CSS'
                            },
                            {
                              component: JsCode,
                              title: '🧩 JS'
                            },
                          ]
                        },
                      
                      ]
                    },
                    {
                      type: 'row',
                      content: [
                        {
                          type: 'stack',
                          content: [
                            {
                              component: ResultComponent,
                              title: '🖥️ Result'
                            },
                            {
                              component: ErrorMessage,
                              title: '🐞 Console'
                            },
                          ]
                        }
                      ]
                    },
                  ]
                }
              ]
            }}
            autoresize={true}
            debounceResize={100}
            onLayoutReady={setLayoutManager}
          />
      </S.DockingContainer>
    </CodeProvider>
  );
})

export default Layout


const S = {
  DockingContainer: styled.div`
    width: 100%;
    height: calc(100vh - var(--Header_Height));
    overflow: hidden;
    position: relative;
  `,
  LoadingContainer: styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  `
}
