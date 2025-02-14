import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Crud from "./pages/Crud/Crud";
import ToDo from "./pages/ToDo/ToDo";
import Notes from "./pages/Notes/Notes";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/crud" element={<Crud />} />
        <Route path="/todo" element={<ToDo />} />
        <Route path="/notes" element={<Notes />} />
        {/* Adicione mais rotas para outros projetos aqui */}
      </Routes>
    </Router>
  );
}

export default App;