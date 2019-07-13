import React from 'react';
import { ListViewRow, Checkbox } from 'react-desktop/macOs';

interface OwnProps {
  setChecked: (id: Symbol, value: boolean) => void;
}

export interface ToDoType {
  id: Symbol;
  title: string;
  checked?: boolean;
}

type P = OwnProps & ToDoType;

const Task: React.FC<P> = props => {
  const { title, id, checked, setChecked } = props;
  return (
    <ListViewRow background={'#d8dadc'}>
      <Checkbox
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const { value } = e.target;
          setChecked(id, value === 'on');
        }}
        defaultChecked={checked}
      />

      {title}
    </ListViewRow>
  );
};

export default Task;
