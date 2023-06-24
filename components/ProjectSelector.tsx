import { FC, useContext, useRef, useState } from "react";
import { uuid } from "uuidv4";
import { AppContext } from "./Mocode";
import styled from "styled-components";
import JSZip from 'jszip';

export const ProjectSelector: FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const startRenamingProject = (id: string) => {
    const currentName = state.projects.find(project => project.id === id)?.name;
    if (!currentName) return;

    setNewProjectName(currentName);
    setRenamingProjectId(id);
  };

  const onCancel = (id: string) => {
    if (renamingProjectId === id) {
      setNewProjectName('');
      setRenamingProjectId(null);
    }
  };

  const onSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (newProjectName && renamingProjectId === id) {
      dispatch({ type: 'renameProject', payload: { id: renamingProjectId, name: newProjectName } });
      setRenamingProjectId(null);
      setNewProjectName('');
    }
  };

  const createNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName) {
      const id = uuid();
      dispatch({ type: 'createProject', payload: { name: newProjectName, id } });
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  const duplicateProject = (id: string) => {
    dispatch({ type: 'duplicateProject', payload: id });
  };

  const selectProject = (id: string) => {
    dispatch({ type: 'selectProject', payload: id });
  };

  const deleteProject = (id: string) => {
    if (state.projects.length <= 1) {
      alert('You cannot delete the last project');
      return;
    }

    if (window.confirm('Are you sure you want to delete this project?')) {
      dispatch({ type: 'deleteProject', payload: id });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    JSZip.loadAsync(file).then(zip => {
      zip.file('project.json')?.async('text').then(content => {
        const project = JSON.parse(content);
        dispatch({ type: 'importProject', payload: project });
      });
    });
  };

  const downloadRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      {state.projects.map(project => (
        <S.Project key={project.id} active={project.id === state.currentProjectId}>
          {renamingProjectId === project.id ? (
            <S.Form onSubmit={(e: any) => onSubmit(e, project.id)}>
              <S.Input
                type="text"
                value={newProjectName}
                onChange={(e: any) => setNewProjectName(e.target.value)}
                autoFocus
              />
              <S.Spacer />
              <S.Button type="submit">Submit</S.Button>
              <S.Button type="button" onClick={() => onCancel(project.id)}>Cancel</S.Button>
            </S.Form>
          ) : (
            <>
              <S.Name onClick={() => selectProject(project.id)}>{project.name}</S.Name>
              <S.Spacer onClick={() => selectProject(project.id)} />
              <S.Button onClick={() => startRenamingProject(project.id)}>✏️</S.Button>
              <S.Button onClick={() => duplicateProject(project.id)}>✂️</S.Button>
              <S.Button onClick={() => {dispatch({ type: 'exportProject', payload: project.id })}}>📥</S.Button>
              <S.Button onClick={() => deleteProject(project.id)}>🗑</S.Button>
            </>
          )}
        </S.Project>
      ))}
      <S.Spacer3 />
      {
        isCreating
          ? <S.Form onSubmit={createNewProject}>
              <S.Input
                type="text"
                value={newProjectName}
                onChange={(e: any) => setNewProjectName(e.target.value)}
                placeholder="New project name"
                autoFocus
              />
              <S.Spacer />
              <S.Button type="submit">Submit</S.Button>
              <S.Button type="button" onClick={() => {setIsCreating(false); setNewProjectName('');}}>Cancel</S.Button>
            </S.Form>
        : <S.Button onClick={() => setIsCreating(true)}>Create a New Project</S.Button>
      }
      <S.Spacer2 />
      <S.Button 
        onClick={() => {
          if (downloadRef?.current) {
            (downloadRef.current as HTMLInputElement).click()
          }
        }}
      >
        Import project
      </S.Button>
      <input type="file" style={{ display: 'none' }} ref={downloadRef} accept="application/zip" onChange={handleFileUpload} />

    </div>
  );
};

const S = {
  Project: styled.div<{
    active: boolean
  }>`
    display: flex;
    align-items: center;
    width: calc(100% - 1rem);
    border-bottom: 1px solid #121212;
    padding: 0 .5rem;
    background: ${props => props.active ? 'var(--Surface_0)' : 'none'};
    font-weight: ${props => props.active ? '600' : '400'};
  `,
   Form: styled.form`
    display: flex;
    align-items: center;
    border-bottom: 1px solid #121212;
    width: calc(100% - .5rem);
    padding-right: .5rem;
  `,
  Name: styled.div`
    flex-shrink: 0;
    color: var(--Font_Color);
    font-size: var(--Font_Size);
  `,
  Spacer: styled.div`
    width: 100%;
    height: 32px;
  `,
  Spacer2: styled.div`
    width: 100%;
  `,
  Spacer3: styled.div`
    height: 1rem;
    width: 100%;
 `,
  Button: styled.button`
    background: none;
    height: 32px;
    padding: 0 .5rem;
    border: none;
    color: var(--Font_Color_Label);
    font-size: var(--Font_Size);
  `,
  Input: styled.input`
    background: none;
    height: 32px;
    padding: 0 .5rem;
    border: none;
    color: var(--Font_Color);
    font-size: var(--Font_Size);
  `
}
