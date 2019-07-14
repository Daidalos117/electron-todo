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
  Button,
  SearchField,
  ListViewRow
} from 'react-desktop/macOs';
import styled from 'styled-components';
import constants from './constants';
import { v4 } from 'uuid';
import { DeleteTodo } from 'components/types';
import { FaGripVertical } from 'react-icons/fa';
import {
  SortableContainer,
  SortableElement,
  SortEnd
} from 'react-sortable-hoc';

/**
 * Electron stuff
 */
declare global {
  interface Window {
    require: any;
    delDialog: any;
  }
}
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const StyledApp = styled.div`
  background-color: rgba(255, 255, 255, 0.4);
  height: calc(100% - 4rem);
  padding: 2rem 0;
  margin: 2rem;
  box-sizing: border-box;
`;

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
  animation-duration: 0.3s;
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

const StyledSearch = styled.div`
  max-width: 15rem;
  margin-left: auto;
  margin-top: 2rem;
`;

const StyledGripIcon = styled.div`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.4;
`;

const App: React.FC = () => {
  const [toDos, setTodos] = useState<ToDoType[]>([]);
  const [newTask, setNewTask] = useState('');
  const [delDialog, setDelDialog] = useState<false | string>(false);
  window.delDialog = delDialog;

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const body = document.querySelector('body');

    if (body) {
      body.addEventListener('keypress', (e: any) => {
        const code = e.key;
        if (window.delDialog && code === 'Enter') {
          realDelete();
        }
      });
    }
  }, []);

  const fetchTasks = () => {
    ipcRenderer.send(constants.TASKS_LOAD);
    ipcRenderer.on(constants.TASKS_LOAD, (event: any, data: any) => {
      if (Array.isArray(data)) {
        setTodos(data);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reduced =
      toDos.length > 0 &&
      toDos.reduce((prev: ToDoType, current: ToDoType) =>
        prev.index > current.index ? prev : current
      );

    const newIndex =
      (reduced && typeof reduced.index !== 'undefined' && reduced.index + 1) ||
      0;

    const newTodos = [
      ...toDos,
      {
        id: v4(),
        title: newTask,
        index: newIndex
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

  const filterTodos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value === '') {
      fetchTasks();
      return;
    }
    const newTodos = toDos.filter((todo: ToDoType) => {
      //g - global, i - insesitive, neresi velikosti
      const regex = new RegExp(value, 'gi');
      return todo.title.match(regex);
    });
    setTodos(newTodos);
  };

  const SortableItem = SortableElement((props: any) => (
    <ListViewRow paddingLeft="20">
      <StyledGripIcon>
        <FaGripVertical />
      </StyledGripIcon>
      <Task {...props} setTodo={setTodo} deleteTodo={deleteTodo} />
    </ListViewRow>
  ));

  const SortableList = SortableContainer((props: any) => {
    const { items } = props;
    return (
      <ListViewSection>
        {items
          .sort((a: ToDoType, b: ToDoType) => a.index - b.index)
          .map((todo: ToDoType) => (
            <SortableItem {...todo} key={todo.id} index={todo.index} />
          ))}
      </ListViewSection>
    );
  });

  // Soting FNC
  const onSortEnd = ({ newIndex, oldIndex }: SortEnd) => {
    const newTodos = toDos.map((todo: ToDoType) => {
      const { index } = todo;
      if (newIndex < oldIndex) {
        todo.index = index >= newIndex ? index + 1 : index;
      } else if (newIndex > oldIndex) {
        todo.index = index <= newIndex ? index - 1 : index;
      }

      if (index === oldIndex) {
        todo.index = newIndex;
      }
      return todo;
    });

    saveSetTodos(newTodos);
  };

  const realDelete = () => {
    saveSetTodos(toDos.filter(todo => todo.id !== delDialog));
    setDelDialog(false);
  };

  return (
    <StyledApp className="App">
      {delDialog && (
        <StyledDialog>
          <Dialog
            title="Delete?"
            message="Are you sure you want to delete this task?"
            buttons={[
              <Button onClick={() => setDelDialog(false)}>Cancel</Button>,
              <Button color="blue" onClick={realDelete}>
                Delete
              </Button>
            ]}
          />
        </StyledDialog>
      )}

      <Text textAlign="center" size="32" marginBottom={10} padding={0}>
        Todo app ♥
      </Text>

      <StyledSearch>
        <SearchField
          placeholder="Search"
          defaultValue=""
          onChange={filterTodos}
          onCancel={() => fetchTasks()}
        />
      </StyledSearch>
      <div>
        <ListView background="#f1f2f4" width="100%">
          <ListViewHeader>
            <Text size="11" color="#696969">
              Order by name
            </Text>
          </ListViewHeader>

          <SortableList
            items={toDos}
            onSortEnd={onSortEnd}
            lockAxis="y"
            pressThreshold={20}
            distance={20}
          />

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
    </StyledApp>
  );
};

export default App;
