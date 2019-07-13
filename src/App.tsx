import React, { useEffect, useState } from 'react';
import Task, { ToDoType } from 'components/Task';
import {
  TextInput,
  Text,
  ListView,
  ListViewHeader,
  ListViewFooter,
  ListViewSection
} from 'react-desktop/macOs';
import styled from 'styled-components';
import constants from './constants';
import { v4 } from 'uuid';

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

const App: React.FC = () => {
  const [toDos, setTodos] = useState<ToDoType[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    ipcRenderer.send(constants.TASKS_LOAD);
    ipcRenderer.on(constants.TASKS_LOAD, (event:any, data:any) => {
      setTodos(data)
    })
  }, [])

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



  const saveSetTodos = (todos: ToDoType[]) => {
    setTodos(todos);
    ipcRenderer.send(constants.TASKS_SAVE, todos);
  };


  return (
    <div className="App">
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
            <Task {...todo} key={todo.id} setTodo={setTodo} />
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
