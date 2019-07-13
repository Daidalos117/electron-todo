import React, { useEffect, useState } from 'react';
import Task, { ToDoType } from 'components/Task';
import { TextInput, Text } from 'react-desktop/macOs';
import styled from 'styled-components';

/**
 * Electron stuff
 */
declare global {
  interface Window {
    require: any;
  }
}
const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer  = electron.ipcRenderer;


const App: React.FC = () => {
  const [toDos, setTodos] = useState<ToDoType[]>([]);
  const [newTask, setNewTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTodos([
      ...toDos,
      {
        id: Symbol(),
        title: newTask
      }
    ]);
    setNewTask('');
  };

  const setChecked = (id: Symbol, value: boolean) => {
    const newTodos = toDos.map((task:ToDoType) => {
      if (task.id === id) {
        task.checked = value;
      }
      return task;
    })
    setTodos(newTodos)
  }

  console.log(ipcRenderer)

  return (
    <div className="App">
      <Text padding="0 100px" textAlign="center" size="32" marginBottom={20}>
        Todo app
      </Text>

      {toDos.map(todo => (
        <Task {...todo} key={todo.title} setChecked={setChecked} />
      ))}

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
    </div>
  );
};

export default App;
