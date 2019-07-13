import React from 'react';
import { ListViewRow, Checkbox } from 'react-desktop/macOs';
import styled from 'styled-components';
import { FaTrashAlt } from 'react-icons/fa';
import { SetTodo, DeleteTodo } from './types';

interface OwnProps {
  setTodo: SetTodo;
  deleteTodo: DeleteTodo;
}

export interface ToDoType {
  id: string;
  title: string;
  checked?: boolean;
}

const CheckBox = styled.input.attrs({ type: 'checkbox' })`
  borderwidth: 1px;
  borderstyle: solid;
  bordercolor: #b8b8b8;
  borderradius: 3px;
  backgroundcolor: #ffffff;
  padding: 6px;
  margin: 0 1px;
  boxshadow: inset 0 1px 0 0 rgba(224, 224, 224, 0.4);
  transition: all 0.4s;

  :focus {
    outline: none;
  }
`;

const StyledText = styled.div`
  font-size: 1rem;
  display: flex;
  justify-content: space-between;
  width: 100%;
  input {
    width: 100%;
    font-size: 1rem;
  }
`;

type P = OwnProps & ToDoType;

const Task: React.FC<P> = props => {
  const { title, id, checked, setTodo, deleteTodo } = props;
  const [edit, setEdit] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState(title);

  const setChecked = (id: string, value: boolean) => {
    const newTodo = { ...props, checked: value };
    setTodo(newTodo);
  };

  const saveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    const newTodo = { ...props, title: editedTitle };
    setTodo(newTodo);
    setEdit(false);
  };

  return (
    <ListViewRow>
      <Checkbox
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const { checked } = e.target;
          setChecked(id, checked);
        }}
        defaultChecked={checked}
      />
      <StyledText
        onClick={(e: React.MouseEvent) => setEdit(!edit ? true : true)}
      >
        {edit ? (
          <form onSubmit={saveTitle}>
            <input
              type="text"
              value={editedTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditedTitle(e.target.value)
              }
            />
          </form>
        ) : (
          title
        )}
      </StyledText>
      <a
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          deleteTodo(id);
        }}
      >
        <FaTrashAlt />
      </a>
    </ListViewRow>
  );
};

export default Task;
