import {ToDoType} from "./Task";

export type SetTodo = (todo: ToDoType) => void;
type SetTodoParams = Parameters<SetTodo>


export type DeleteTodo = (id: string) => void;

