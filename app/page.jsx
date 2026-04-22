'use client';

import { useState } from 'react';
import Header from "../components/Header";
import Note from "../components/Note";
import CreateArea from "../components/CreateArea";
import Footer from '../components/Footer';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editObject, setEditObject] = useState({ id: 0, title: "", content: "" });


  const filteredNotes = searchTerm.trim() 
    ? notes.filter((note) => {
        const search = searchTerm.toLowerCase();
        return note.title.toLowerCase().includes(search) || 
               note.content.toLowerCase().includes(search);
      })
    : notes;

  const isSearchMode = searchTerm.trim().length > 0;


  const showEmptyMessage = isSearchMode && filteredNotes.length === 0;

  function handleEditChange(name, value) {
    setEditObject(prev => ({ ...prev, [name]: value }));
  }

  function addNote(newNote) {
    setNotes((prev) => [...prev, { ...newNote, noteID: Date.now() }]);
  }

  function addEditNote(editNote) {
    setNotes((prev) => prev.map((note) => note.noteID !== editNote.id ? note : { ...note, title: editNote.title, content: editNote.content }));
    setEditMode(false);
  }

  function deleteNote(id) {
    setNotes((prev) => prev.filter((note) => note.noteID !== id));
  }

  function editNote(id) {
    const noteToEdit = notes.find((note) => note.noteID === id);
    if (noteToEdit) {
      setEditMode(true);
      setEditObject({ id: noteToEdit.noteID, title: noteToEdit.title, content: noteToEdit.content });
    }
  }

  return (
    <div>
      <Header onSearch={setSearchTerm} />
      <CreateArea 
        onEditChange={handleEditChange}
        onAdd={addNote}
        onAddEditNote={addEditNote}
        onCancelEdit={() => setEditMode(false)}
        {...(editMode && { editId: editObject.id, editTitle: editObject.title, editContent: editObject.content, editOn: true })}
      />
      
      <div className="notes-container">
        {filteredNotes.map((noteItem) => {
          if (editMode && noteItem.noteID === editObject.id) return null;
          return (
            <Note key={noteItem.noteID} id={noteItem.noteID} title={noteItem.title} content={noteItem.content} onDelete={deleteNote} onEdit={editNote} />
          );
        })}
      </div>


      {showEmptyMessage && (
        <div className="error-message">
          <ErrorOutlineIcon style={{ fontSize: "1.25rem", marginRight: "8px", verticalAlign: "middle" }} />
          <span>No results found!</span>
        </div>
      )}

      <Footer />
    </div>
  );
}
