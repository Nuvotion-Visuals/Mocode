import { FC, useContext, useState } from "react";
import { uuid } from "uuidv4";
import { AppContext } from "./Mocode";

export const ProjectSelector: FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const [inputValue, setInputValue] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [renamingProjectId, setRenamingProjectId] = useState('');

  const toggleInputVisibility = () => {
    setIsInputVisible(!isInputVisible);
    setInputValue('');
    setRenamingProjectId('');
  };

  const onCancel = () => {
    setInputValue('');
    setIsInputVisible(false);
    setRenamingProjectId('');
  };

  const startRenamingProject = (id: string) => {
    const currentName = state.projects.find(project => project.id === id)?.name;
    if (!currentName) return;

    setInputValue(currentName);
    setIsInputVisible(true);
    setRenamingProjectId(id);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue) {
      if (renamingProjectId) {
        dispatch({ type: 'renameProject', payload: { id: renamingProjectId, name: inputValue } });
        setRenamingProjectId('');
      } else {
        const id = uuid();
        dispatch({ type: 'createProject', payload: { name: inputValue, id } });
      }
      setInputValue('');
      setIsInputVisible(false);
    }
  };

  const selectProject = (id: string) => {
    dispatch({ type: 'selectProject', payload: id });
  }

  const deleteProject = (id: string) => {
    if (state.projects.length > 1) dispatch({ type: 'deleteProject', payload: id });
    else alert('You cannot delete the last project');
  }

  return (
    <div>
      <button onClick={toggleInputVisibility}>Create a New Project</button>
      {isInputVisible && (
        <form onSubmit={onSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
          <button type="submit">Submit</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </form>
      )}
      {state.projects.map(project => (
        <div key={project.id}>
          <button onClick={() => selectProject(project.id)}>{project.name}</button>
          {project.id === state.currentProjectId ? (
            <>
              <span>ACTIVE</span>
              <button onClick={() => startRenamingProject(project.id)}>Rename</button>
            </>
          ) : (
            <>
              <button onClick={() => deleteProject(project.id)}>Delete</button>
              <button onClick={() => startRenamingProject(project.id)}>Rename</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
