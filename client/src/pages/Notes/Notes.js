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
    await axios.put(`http://localhost:8080/notes/${editNotes._id}`, { title, note, date, status });
    fetchNotes();
    setTitle("");
    setNote("");
    setDate("");
    setStatus(null);
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
      console.error("Erro ao adicionar notas:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Exemplo de Notes</h1>

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
      <div className="row">
        {notes.map((note, index) => (
          <div key={index} className="col-md-4 col-sm-12 py-2">
            <div className="card">
              <div className="card-header">
                <h3 className="mb-0">{note.title}</h3>
              </div>
              <div className="card-body">
                <p className="mb-0">{note.note}</p>
              </div>
              <div className="card-footer">
                <div className="d-flex align-items-center justify-content-end gap-2 me-auto">
                  <button 
                    type="button" 
                    onClick={() => handleEdit(note)} 
                    className="btn btn-sm btn-info rounded-pill text-white"
                  >Editar nota</button>
                  <button type="button" className={`btn btn-sm ${note.status ? "btn-secondary" : "btn-success"} rounded-pill text-white`}>{note.status ? "Desfazer conclusão" : "Finalizar nota"}</button>
                  <p className="small mb-0">{FormatDate(note.date)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;