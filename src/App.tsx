import React, {ChangeEvent, useState} from 'react';
import './App.css';

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

  function removeTask(taskToRemove: string): void{
    const index = todoList.indexOf(taskToRemove);
    if(index !== -1){
      const newList = todoList.splice(index+1, 1); // remove the task
      setTodoList(newList);
    }
  }

  function TodoTaskList(task: string){
    return (
      <div className='tasklist'>
        <div>{task}
        <button className='removeButton' onClick={function() {removeTask(task)}}>Remove</button>
        </div>
      </div>
    )
  };


  return (
    <div className='todolist-app'>
      <h1>TODO LIST</h1>
      <div className='header'>
        <input type='text' placeholder='Enter A Task' onFocus={function(event) {event.target.select()}} onChange={handleChange}/>
        <button onClick={addTask}>Add Task</button>
      </div>
      <div className='todolist'>
        {todoList.map(TodoTaskList)}
      </div>
    </div>
  );
}

export default App;
