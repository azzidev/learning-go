import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Meus Projetos</h1>
      <ul className="list-group">
        <li className="list-group-item">
          <Link to="/crud" className="text-decoration-none">
            CRUD de Usuários
          </Link>
        </li>
        <li className="list-group-item">
          <Link to="/todo" className="text-decoration-none">
            ToDo
          </Link>
        </li>
        {/* Adicione mais projetos aqui */}
      </ul>
    </div>
  );
}

export default Home;