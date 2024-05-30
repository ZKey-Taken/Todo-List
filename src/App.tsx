import React, {ChangeEvent, useState} from 'react';
import './App.css';
import { gql, useQuery } from '@apollo/client';

interface User{
  id: string;
  name: string;
  todos: Todo[];
}

interface Todo{
  task: string;
  is_completed: boolean;
}

const GET_USERS = gql`
  query TodoListQuery {
    users {
      id
      name
      todos {
        task
        is_completed
      }
    }
  }
`;

function DisplayUsersTodos(){
  const {loading, error, data} = useQuery(GET_USERS);

  if(loading){
    return <p>Loading ...</p>
  };
  if(error){
    return <p>Error: {error.message}</p>
  };

  return (
    <div>
      {data.users.map(({ id, name, todos }: User) => (
        <div key={id}>
          <h2>{name}</h2>

        </div>
      ))}
    </div>
  );
};


function App() {
  const [task, setTask] = useState<string>("");
  const [todoList, setTodoList] = useState<string[]>([]);
  
  function handleChange(event: ChangeEvent<HTMLInputElement>): void{
    event.preventDefault();
    setTask(event.target.value);
  };

  function addTask(): void{
    if(task.length > 0 && !todoList.includes(task)){ // Add only if task isn't empty and task isn't a dup
      setTodoList([...todoList, task]); // Adds task into todo list
    }
  };

  /*
  function removeTask(taskToRemove: string): void{
    const index = todoList.indexOf(taskToRemove);
    if(index !== -1){
      const newList = todoList.splice(index+1, 1); // remove the task
      setTodoList(newList);
    }
  }
  */


  return (
    <div className='todolist-app'>
      <h1>TODO LIST</h1>
      <div className='header'>
        <input type='text' placeholder='Name' onFocus={function(event) {event.target.select()}} onChange={handleChange}/>
        <input type='text' placeholder='Enter A Task' onFocus={function(event) {event.target.select()}} onChange={handleChange}/>
        <button onClick={addTask}>Add Task</button>
      </div>
      <div className='todolist'>
        <DisplayUsersTodos />
      </div>
    </div>
  );
}

export default App;
