import React, { useEffect, useState } from 'react';
import Task, { ToDoType } from 'components/Task';
import {
  TextInput,
  Text,
  ListView,
  ListViewHeader,
  ListViewFooter,
  ListViewSection,
  Dialog,
  Button
} from 'react-desktop/macOs';
import styled from 'styled-components';
import constants from './constants';
import { v4 } from 'uuid';
import { SetTodo, DeleteTodo } from 'components/types';

/**
 * Electron stuff
 */
declare global {
  interface Window {
    require: any;
  }
}
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const StyledDialog = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 10;
  align-items: center;
  justify-content: center;
  display: flex;
  animation-name: zoomIn;
  animation-duration: 0.5s;
  @keyframes zoomIn {
    from {
      opacity: 0;
      transform: scale3d(0.3, 0.3, 0.3);
    }

    50% {
      opacity: 1;
    }
  }
`;

const App: React.FC = () => {
  const [toDos, setTodos] = useState<ToDoType[]>([]);
  const [newTask, setNewTask] = useState('');
  const [delDialog, setDelDialog] = useState<false | string>(false);

  useEffect(() => {
    ipcRenderer.send(constants.TASKS_LOAD);
    ipcRenderer.on(constants.TASKS_LOAD, (event: any, data: any) => {
      setTodos(data);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTodos = [
      ...toDos,
      {
        id: v4(),
        title: newTask
      }
    ];
    saveSetTodos(newTodos);
    setNewTask('');
  };

  const setTodo = (updateTodo: ToDoType) => {
    saveSetTodos(
      toDos.map((todo: ToDoType) =>
        todo.id === updateTodo.id ? updateTodo : todo
      )
    );
  };

  const deleteTodo: DeleteTodo = (id: string) => {
    setDelDialog(id);
  };

  const saveSetTodos = (todos: ToDoType[]) => {
    setTodos(todos);
    ipcRenderer.send(constants.TASKS_SAVE, todos);
  };

  return (
    <div className="App">
      {delDialog && (
        <StyledDialog>
          <Dialog
            title="Delete?"
            message="Are you sure you want to delete this task?"
            buttons={[
              <Button onClick={() => setDelDialog(false)}>Cancel</Button>,
              <Button
                color="blue"
                onClick={() => {
                  saveSetTodos(toDos.filter(todo => todo.id != delDialog));
                  setDelDialog(false);
                }}
              >
                Delete
              </Button>
            ]}
          />
        </StyledDialog>
      )}

      <Text padding="0 100px" textAlign="center" size="32" marginBottom={20}>
        Todo app
      </Text>
      <ListView background="#f1f2f4" width="100%">
        <ListViewHeader>
          <Text size="11" color="#696969">
            Order by name
          </Text>
        </ListViewHeader>
        <ListViewSection>
          {toDos.map(todo => (
            <Task
              {...todo}
              key={todo.id}
              setTodo={setTodo}
              deleteTodo={deleteTodo}
            />
          ))}
        </ListViewSection>
        <ListViewFooter>
          <form onSubmit={handleSubmit}>
            <TextInput
              label="New ToDo"
              placeholder="Cut the cat"
              value={newTask}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewTask(e.target.value)
              }
            />
          </form>
        </ListViewFooter>
      </ListView>
    </div>
  );
};

export default App;
