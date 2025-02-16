import React, { useState, useEffect }  from "react";
import { BrowserRouter as Router, Routes, Route, Navigate  } from "react-router-dom";
import Home from "./pages/Home/Home";
import Crud from "./pages/Crud/Crud";
import ToDo from "./pages/ToDo/ToDo";
import Notes from "./pages/Notes/Notes";
import Login from "./pages/Login/Login";

function App() {
  // Estado para controlar a autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verifica se há um token no localStorage ao carregar o App
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true); // Define como autenticado se houver um token
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Rota de Login */}
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />

        {/* Rotas Protegidas */}
        <Route
          path="/"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/crud"
          element={isAuthenticated ? <Crud /> : <Navigate to="/login" />}
        />
        <Route
          path="/todo"
          element={isAuthenticated ? <ToDo /> : <Navigate to="/login" />}
        />
        <Route
          path="/notes"
          element={isAuthenticated ? <Notes /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;