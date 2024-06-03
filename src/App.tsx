import React, { useState } from 'react';
import './App.css';
import { gql, useMutation, useQuery } from '@apollo/client';
import { UUID } from 'crypto';

interface User{
  id: UUID;
  name: string;
  todos: Todo[];
}

interface Todo{
  id: UUID;
  task: string;
  is_completed: boolean;
}

const GET_USERS = gql`
  query TodoListQuery {
    users {
      id
      name
      todos {
        id
        task
        is_completed
      }
    }
  }
`;

const ADD_TASK_NEW_USER = gql`
  mutation AddTaskNewUser($task: String!, $name: String!) {
    insert_todos_one(object: {is_completed: false, task: $task, user: {data: {name: $name}}}) {
      id
      task
      is_completed
      user {
        id
        name
      }
    }
  }
`;

const ADD_TASK_OLD_USER = gql`
  mutation AddTaskOldUser($task: String!, $userId: uuid!){
    insert_todos_one(object: {task: $task, is_completed: false, user_id: $userId}) {
      id
      is_completed
      task
      user_id
    }
  }
`;

const UPDATE_TASK_COMPLETION = gql`
  mutation UpdateTaskCompletion($id: uuid!, $is_completed: Boolean!){
    update_todos_by_pk(pk_columns: {id: $id}, _set: {is_completed: $is_completed}) {
      id
      is_completed
    }
  }
`;

const REMOVE_TASK = gql`
  mutation RemoveTask($id: uuid!){
    delete_todos_by_pk(id: $id) {
      id
    }
  }
`;

function AddTask(){
  const [addTaskToNewUser] = useMutation(ADD_TASK_NEW_USER);
  const [addTaskToOldUser] = useMutation(ADD_TASK_OLD_USER);
  const { loading, error, data } = useQuery(GET_USERS);
  const [todoTask, setTodoTask] = useState<string>("");
  const [personName, setPersonName] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(todoTask.length <= 0){ // If task is an empty string
      return;
    }

    if(loading){
      return <p>Loading ...</p>
    }
    if(error){
      return <p>Error: {error.message}</p>
    }
    
    // Make a dictionary/hashmap to store all userName to userId
    const userNameToUserId = new Map<string, UUID>();
    data.users.forEach((user: User) => {
      userNameToUserId.set(user.name, user.id);
    });

    if(userNameToUserId.has(personName)){ // Name exists so we add task to old user
      addTaskToOldUser({
        variables: {
          task: todoTask,
          userId: userNameToUserId.get(personName)
        },
        refetchQueries: [{ query: GET_USERS }]
      });
    }else{ // Add task to new user
      addTaskToNewUser({
        variables: {
          task: todoTask,
          name: personName
        },
        refetchQueries: [{ query: GET_USERS }]
      });
    }
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

  function handleCheckBox(taskId: UUID, is_completed: boolean){
    if(taskId.length <= 0){
      console.error("Error, taskId:" + taskId);
      return;
    }

    updateTaskCompletion({
      variables: {
        id: taskId,
        is_completed: !is_completed
      },
      refetchQueries: [{ query: GET_USERS }]
    });
  } 

  function handleRemove(taskId: UUID){
    if(taskId.length <= 0){
      console.error("Error, taskId:" + taskId);
      return;
    }

    removeTask({
      variables: {
        id: taskId
      },
      refetchQueries: [{ query: GET_USERS }]
    });
  }

  function displayName(name: string, todos: Todo[]){ 
    // function only display names with tasks, in other words if a user doesn't have any task dont display.
    if(todos.length > 0){
      return(
        <h2>{name}</h2>
      );
    }else{
      return;
    }
  }
  
  return (
    <div>
      {data.users.map((user: User) => (
        <div key={user.id}>
          {displayName(user.name, user.todos)}
          {user.todos.map((todo: Todo) =>(
            <div key={todo.id}>
            <label>{todo.task}</label>
            <input type='checkbox' 
              checked={todo.is_completed}
              onChange={() => handleCheckBox(todo.id, todo.is_completed)}/>
            <button onClick={() => handleRemove(todo.id)}>Remove</button>
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
