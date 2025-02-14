import React, { useState, useEffect } from "react";
import axios from "axios";
import FormatDate from "../../components/FormatDate"
import CurrentDate from "../../components/CurrentDate"
import "bootstrap/dist/css/bootstrap.min.css"; // Importe o CSS do Bootstrap
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState(Boolean);
  const [editNotes, setEditNotes] = useState(null)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await axios.get("http://localhost:8080/notes");
      setNotes(response.data);
    } catch (error) {
      console.error("Erro ao buscar notas:", error);
    }
  };

  const handleEdit = (note) => {
    setEditNotes(note);
    setTitle(note.title);
    setStatus(note.status);
    setNote(note.note);
    setDate(CurrentDate())
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/notes/${editNotes._id}`, { title, note, date, status });
      fetchNotes();
      setTitle("");
      setNote("");
      setDate("");
      setStatus(null);
    } catch (error) {
      console.error("Erro ao atualizar notas:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setDate(CurrentDate());
      setStatus(false);

      await axios.post("http://localhost:8080/notes", { title, note, date, status });

      fetchNotes();
      setTitle("");
      setNote("");
      setDate("");
      setStatus(null);
    } catch (error) {
      console.error("Erro ao adicionar nota:", error);
    }
  };

  const handleDelete = async (note) => {
    try {
      await axios.delete(`http://localhost:8080/notes/${note._id}`);
      fetchNotes();
    } catch (error) {
      console.error("Erro ao deletar nota:", error);
    }
  }

  const handleArchive = async (note) => {
    try {
      const newStatus = !note.status;
      const updatedDate = CurrentDate();

      await axios.put(`http://localhost:8080/notes/${note._id}`, {
        title: note.title, 
        note: note.note, 
        date: updatedDate, 
        status: newStatus 
      });

      fetchNotes();
    } catch (error) {
      console.error("Erro ao arquivar nota:", error);
    }
  }

  return (
    <div className="container">
      <h1 className="text-center mt-4 mb-4">Exemplo de Notes</h1>

      <form onSubmit={editNotes ? handleUpdate : handleSubmit} className="mb-4">
        <div className="mb-3">
          <div className="form-group mb-3">
            <label>Nome da Nota</label>
            <input 
              className="form-control fs-5"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label>Nota</label>
            <textarea
              className="form-control fs-5"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary rounded-pill fs-5 me-2 w-100">
              {editNotes ? "Atualizar Nota" : "Adicionar Nota"}
            </button>
          </div>
        </div>
      </form>
      <h1 className="mb-3">Notas</h1>
      <div className="row mb-5">
        {notes
          .filter(note => !note.status)
          .map((note, index) => (
            <div key={index} className="col-md-4 col-sm-12 py-2 d-flex">
              <div className="card">
                <div className="card-header">
                  <h3 className="mb-0">{note.title}</h3>
                </div>
                <div className="card-body">
                  <p className="mb-0">{note.note}</p>
                </div>
                <div className="card-footer">
                  <div className="d-flex align-items-center justify-content-center gap-2 me-auto">
                    <button 
                      type="button" 
                      onClick={() => handleEdit(note)} 
                      className="btn btn-sm btn-info rounded-pill text-white"
                    >Editar nota</button>
                    <button type="button" className="btn btn-sm btn-secondary rounded-pill text-white" onClick={() => handleArchive(note)}>Arquivar nota</button>
                    <button type="button" className="btn btn-sm btn-danger rounded-pill" onClick={() => handleDelete(note)} >Deletar nota</button>
                  </div>
                  <p className="text-center mt-2 small mb-0">última atualização: {FormatDate(note.date)}</p>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      <h3 className="mb-3">Notas arquivadas</h3>
      <ul className="list-group mb-5">
        {notes
          .filter(note => note.status)
          .map((note, index) => (
            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{note.title}</span>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-sm me-auto btn-warning rounded-pill" onClick={() => handleArchive(note)}>Desarquivar nota</button>
                <button type="button" className="btn btn-sm btn-danger rounded-pill" onClick={() => handleDelete(note)} >Deletar nota</button>
              </div>
            </li>
          ))
        }
      </ul>
    </div>
  );
}

export default App;