import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css"; // Importe o CSS do Bootstrap

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editUser, setEditUser] = useState(null);

  //Configurando o axios para enviar o token jwt
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // Recupera o token do localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Adiciona o token no cabeçalho
    }
    return config;
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/users", { name, email });
      fetchUsers();
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setName(user.name);
    setEmail(user.email);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/users/${editUser.email}`, { name, email });
      fetchUsers();
      setEditUser(null);
      setName("");
      setEmail("");
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  const handleDelete = async (email) => {
    try {
      await axios.delete(`http://localhost:8080/users/${email}`);
      fetchUsers();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Exemplo de CRUD</h1>
      <form onSubmit={editUser ? handleUpdate : handleSubmit} className="mb-4">
        <div className="mb-3">
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <button type="submit" className="btn btn-primary me-2 w-100">
            {editUser ? "Atualizar Usuário" : "Adicionar Usuário"}
          </button>
        </div>
        {editUser && (
          <button
            type="button"
            onClick={() => setEditUser(null)}
            className="btn btn-secondary"
          >
            Cancelar Edição
          </button>
        )}
      </form>
      <ul className="list-group">
        {users.map((user, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              {user.name} - {user.email}
            </span>
            <div>
              <button
                onClick={() => handleEdit(user)}
                className="btn btn-warning btn-md me-2"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(user.email)}
                className="btn btn-danger btn-md"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;