import React, { useState } from 'react';
import './App.css';
import { gql, useMutation, useQuery } from '@apollo/client';

interface User{
  id: string;
  name: string;
  todos: Todo[];
}

interface Todo{
  id: string;
  task: string;
  is_completed: boolean;
}

const typeDefs = gql`
  type Mutation{
    addTask(task: String!, name: String!): Todo
    updateTaskCompletion(id: String!, is_completed: Boolean!): Todo
    removeTask(task: String!): Todo
  }
`;

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

const ADD_TASK = gql`
  mutation AddTask($task: String!, $name: String!) {
    addTask(task: $task, name: $name){
      id
      task
      is_completed
      user{
        id
        name
      }
    }
  }
`;

const UPDATE_TASK_COMPLETION = gql`
  mutation UpdateTaskCompletion($taskId: String, $is_completed: Boolean){
    updateTaskCompletion(id: $taskId, is_completed: $is_completed){
      id
      is_completed
    }
  }
`;

const REMOVE_TASK = gql`
  mutation RemoveTask($taskId: String){
    removeTask(id: $taskId)
      id
  }
`;

function AddTask(){
  const [addTask, { loading, error }] = useMutation(ADD_TASK);
  const [todoTask, setTodoTask] = useState<string>("");
  const [personName, setPersonName] = useState<string>("");

  if(loading){
    return <p>Submitting ...</p>
  }
  if(error){
    return <p>Submission Error: {error.message}</p>
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(todoTask.length <= 0){ // If task is an empty string
      return;
    }

    addTask({
      variables: {
        task: todoTask,
        name: personName
      }
    });
    setTodoTask(""); // Clear text box
    setPersonName("");
  }

  return(
    <div>
      <form onSubmit={handleSubmit}>
        <input 
          type='text' 
          value={personName} 
          placeholder='Name'
          onChange={ (e) => setPersonName(e.target.value)}
        />
        <input
          type='text'
          value={todoTask}
          placeholder='Enter a Task'
          onChange={ (e) => setTodoTask(e.target.value)}
        />
        <button type='submit'>Add Task</button>
      </form>
    </div>
  );
}


function DisplayUsersTodos(){
  const {loading, error, data} = useQuery(GET_USERS);
  const [updateTaskCompletion] = useMutation(UPDATE_TASK_COMPLETION);
  const [removeTask] = useMutation(REMOVE_TASK);

  if(loading){
    return <p>Loading ...</p>
  };
  if(error){
    return <p>Error: {error.message}</p>
  };

  function handleCheckBox(taskId: String, is_completed: Boolean){
    updateTaskCompletion({
      variables: {
        id: taskId,
        is_completed: !is_completed
      }
    });
  } 

  function handleRemove(taskId: String){
    removeTask({
      variables: {
        id: taskId
      }
    });
  }


  return (
    <div>
      {data.users.map(({ id, name, todos }: User) => (
        <div key={id}>
          <h2>{name}</h2>
          {todos.map(({ id: taskId, task, is_completed }) =>(
            <div>
            <label>{task}</label>
            <input type='checkbox' 
              checked={is_completed}
              onChange={() => handleCheckBox(taskId, is_completed)}/>
            <button onClick={() => handleRemove(taskId)}>Remove</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};


function App() {

  return (
    <div className='todolist-app'>
      <h1>TODO LIST</h1>
      <div className='header'>
        <AddTask />
      </div>
      <div className='todolist'>
        <DisplayUsersTodos />
      </div>
    </div>
  );
}

export default App;
