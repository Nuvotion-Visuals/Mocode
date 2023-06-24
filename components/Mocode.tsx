import React, { useReducer, createContext, useContext, useEffect, FC, Dispatch, ReactNode, useState } from 'react'
import styled from 'styled-components'

import { Result } from '../components/Result'
import { GoldenLayoutComponent } from '@annotationhub/react-golden-layout'
import { Code } from '../components/Code'
import { Console } from '../components/Console'

import localForage from 'localforage'
import { uuid } from 'uuidv4'

type Project = {
  id: string;
  name: string;
  code: CodeState;
};

type AppState = {
  projects: Project[];
  currentProjectId: string;
};

type AppAction =
  | { type: 'createProject', payload: { name: string, id: string } }
  | { type: 'deleteProject', payload: string }
  | { type: 'selectProject', payload: string }
  | { type: 'initProject', payload: Project }
  | CodeAction;

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

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    // Handle project-specific actions
    case 'initProject':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'createProject':
      const newProject = {
        id: action.payload.id,
        name: action.payload.name,
        code: { html: '', css: '', javascript: '', error: '' },
      };
      return { ...state, projects: [...state.projects, newProject] };
    case 'deleteProject':
      return { ...state, projects: state.projects.filter(project => project.id !== action.payload) };
    case 'selectProject':
      return { ...state, currentProjectId: action.payload };

    // Delegate code-specific actions to codeReducer
    default:
      const currentProjectIndex = state.projects.findIndex(project => project.id === state.currentProjectId);
      if (currentProjectIndex === -1) return state;
      
      const newProjects = [...state.projects];
      newProjects[currentProjectIndex] = {
        ...newProjects[currentProjectIndex],
        code: codeReducer(newProjects[currentProjectIndex].code, action as CodeAction),
      };

      return { ...state, projects: newProjects };
  }
}

const AppContext = createContext<{ state: AppState, dispatch: Dispatch<AppAction> }>({ state: { projects: [], currentProjectId: '' }, dispatch: () => null });

// Modify AppProvider to provide CodeContext as well
const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, { projects: [], currentProjectId: '' });

  // Get code of the current project
  const currentProject = state.projects.find(project => project.id === state.currentProjectId);
  const currentProjectCode = currentProject ? currentProject.code : { html: '', css: '', javascript: '', error: '' };

  // Dispatch function for CodeContext that maps CodeAction to the current project
  const dispatchCode = (action: CodeAction) => {
    if (!currentProject) return;
    dispatch({ ...action, type: `set${action.type.substr(3)}`, payload: action.payload });
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <CodeContext.Provider value={{ state: currentProjectCode, dispatch: dispatchCode }}>
        {children}
      </CodeContext.Provider>
    </AppContext.Provider>
  );
};


const ProjectSelector: FC = () => {
  const { state, dispatch } = useContext(AppContext);

  const createProject = () => {
    const id = uuid();
    const name = prompt('Enter project name', `Project ${state.projects.length + 1}`);
    if (name) dispatch({ type: 'createProject', payload: { name, id } });
  }

  const deleteProject = (id: string) => {
    if (state.projects.length > 1) dispatch({ type: 'deleteProject', payload: id });
    else alert('You cannot delete the last project');
  }

  const selectProject = (id: string) => {
    dispatch({ type: 'selectProject', payload: id });
  }

  return (
    <div>
      <button onClick={createProject}>Create Project</button>
      {state.projects.map(project =>
        <div key={project.id}>
          <button onClick={() => selectProject(project.id)}>{project.name}</button>
          {project.id === state.currentProjectId
            ? 'ACTIVE'
            :<button onClick={() => deleteProject(project.id)}>Delete</button>}
        </div>
      )}
    </div>
  );
};


const HtmlCode: FC = () => {
  const { state, dispatch } = useContext(CodeContext);
  return <Code type='html' value={state.html} callback={payload => dispatch({ type: 'setHtml', payload })} />;
};

const CssCode: FC = () => {
  const { state, dispatch } = useContext(CodeContext);
  return <Code type='css' value={state.css} callback={payload => dispatch({ type: 'setCss', payload })} />;
};

const JsCode: FC = () => {
  const { state, dispatch } = useContext(CodeContext);
  return <Code type='javascript' value={state.javascript} callback={payload => dispatch({ type: 'setJs', payload })} />;
};
const ErrorMessage: FC = () => {
  const { state } = useContext(CodeContext);

  return <Console content={state.error} />
}

const ResultComponent: FC = () => {
  const { state, dispatch } = useContext(CodeContext);

  return (
    <Result 
      html={state.html} 
      css={state.css} 
      js={state.javascript} 
      onError={payload => dispatch({ type: 'setError', payload })}
    />
  );
};
const Mocode = React.memo(() => {
  const [_, setLayoutManager] = useState({})
  

  const { state, dispatch } = useContext(AppContext);

  // Load projects from localForage when component is mounted
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const storedProjects = await localForage.getItem<Project[]>('projects');
        if (storedProjects?.length) {
          // Initialize the projects with the retrieved data
          storedProjects.forEach(project => {
            dispatch({ type: 'initProject', payload: project });
          });
  
          // Set the first project as the current project
          dispatch({ type: 'selectProject', payload: storedProjects[0].id });
        } else {
          // If there are no stored projects, create a new default one
          const id = uuid();
          dispatch({ type: 'createProject', payload: { name: 'Default Project', id } });
          dispatch({ type: 'selectProject', payload: id });
        }
      } catch (error) {
        console.error("Error fetching stored projects:", error);
      }
    };
    fetchProjects();
  }, [dispatch]);

  // Save projects to localForage whenever state changes
  useEffect(() => {
    const storeProjects = async () => {
      try {
        await localForage.setItem('projects', state.projects);
      } catch (error) {
        console.error("Error storing projects:", error);
      }
    };
    storeProjects();
  }, [state]);
  

  return (

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
                              title: 'HTML'
                            },
                            {
                              component: CssCode,
                              title: 'CSS'
                            },
                            {
                              component: JsCode,
                              title: 'JS'
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
                              title: 'Result'
                            },
                            {
                              component: ErrorMessage,
                              title: 'Console'
                            },
                            {
                              component: ProjectSelector,
                              title: 'Projects'
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

  );
})

const App: FC = () => {
  return (
    <AppProvider>
      <Mocode />
    </AppProvider>
  );
}

export default App


const S = {
  DockingContainer: styled.div`
    width: 100%;
    height: 100vh;
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
