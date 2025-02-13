import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css"; // Importe o CSS do Bootstrap
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [description, setDescription] = useState("");
  const [completed, setCompleted] = useState(Boolean);
  const [editTask, setEditTask] = useState(null)

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:8080/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    }
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setDescription(task.description);
    setCompleted(task.completed);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/tasks/${editTask._id}`, { description, completed });
      fetchTasks();
      setEditTask(null);
      setDescription("");
      setCompleted("");
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setCompleted(false)
      await axios.post("http://localhost:8080/tasks", { description, completed });
      fetchTasks();
      setDescription("");
      setCompleted("");
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
    }
  };

  const handleCompleted  = async (task) => {
    try {
      const updateStatus = {
        description: task.description,
        completed: true
      }

      await axios.put(`http://localhost:8080/tasks/${task._id}`, updateStatus);
      fetchTasks();
      setDescription("");
      setCompleted("");
    } catch (error) {
      console.error("Erro ao finalizar tarefa:", error);
    }
  };

  const handleUndo = async (task) => {
    try {
      const updateStatus = {
        description: task.description,
        completed: false
      }

      await axios.put(`http://localhost:8080/tasks/${task._id}`, updateStatus);
      fetchTasks();
      setDescription("");
      setCompleted("");
    } catch (error) {
      console.error("Erro ao finalizar tarefa:", error);
    }    
  }

  const handleDelete = async (task) => {
    try {
      await axios.delete(`http://localhost:8080/tasks/${task._id}`);
      fetchTasks();
    } catch (error) {
      console.error("Erro ao finalizar tarefa:", error);
    }    
  }
    
  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Exemplo de ToDo</h1>
      <form onSubmit={editTask ? handleUpdate : handleSubmit} className="mb-4">
        <div className="mb-3">
          <input
            type="text"
            placeholder="Nome"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-control fs-5 mb-3"
            required
          />
          {editTask && (
            <div className="form-check fs-5 mb-3">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="todo-completed" 
                checked={completed} 
                onChange={(e) => setCompleted(e.target.checked)} 
              />
              <label className="form-check-label" htmlFor="todo-completed">
                Tarefa completa
              </label>
            </div>
          )}
          <div className="mb-3">
            <button type="submit" className="btn btn-primary fs-5 me-2 w-100">
              {editTask ? "Atualizar Tarefa" : "Adicionar Tarefa"}
            </button>
          </div>
        </div>
      </form>
      <h3 className="text-center mb-4">Lista de tarefas</h3>
      <ul className="list-group fs-5">
        {tasks.map((task, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              <b className={`badge fs-6 me-2 ${task.completed ? "bg-success" : "bg-warning text-black"}`}>
                <i className={`bi fs-6 ${task.completed ? "bi-check-circle text-white" : "bi-x-circle text-black"}`}></i>
              </b>
              {task.description}
            </span>
            <div>
              <button
                onClick={() => task.completed ? handleUndo(task) : handleCompleted(task) }
                className={`btn btn-md me-2 fs-5  ${task.completed ? "btn-secondary" : "btn-success"}`}
              >
                {`${task.completed ? "Desfazer" : "Finalizar"}`}
              </button>
              <button
                onClick={() => handleEdit(task)}
                className="btn btn-warning btn-md me-2 fs-5"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(task)}
                className="btn btn-danger btn-md me-2 fs-5"
              >
                Apagar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;