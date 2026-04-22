'use client';

import { useState, useEffect, useRef } from 'react';
import Header from "../components/Header";
import Note from "../components/Note";
import CreateArea from "../components/CreateArea";
import Footer from '../components/Footer';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  const isMounted = useRef(false);
  
  const [editObject, setEditObject] = useState({
    id: 0,
    title: "",
    content: ""
  });

useEffect(() => {
  const savedNotes = localStorage.getItem("notes");
  if (savedNotes) {
    setNotes(JSON.parse(savedNotes));
  }
  isMounted.current = true; 
}, []);


useEffect(() => {

  if (isMounted.current) {
    localStorage.setItem("notes", JSON.stringify(notes));
  }
}, [notes]);


  useEffect(() => {
    if (searchTerm.trim()) {
      setIsSearchMode(true);
      const results = notes.filter((note) => {
        const search = searchTerm.toLowerCase();
        return (
          note.title.toLowerCase().includes(search) ||
          note.content.toLowerCase().includes(search)
        );
      });
      setFilteredNotes(results);
    } else {
      setIsSearchMode(false);
      setFilteredNotes(notes);
    }
  }, [searchTerm, notes]);


  useEffect(() => {
    if (isSearchMode && filteredNotes.length === 0) {
      setShowEmptyMessage(true);
      const timer = setTimeout(() => setShowEmptyMessage(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowEmptyMessage(false);
    }
  }, [isSearchMode, filteredNotes.length]);

  function addNote(newNote) {
    setNotes((prevNotes) => [
      ...prevNotes,
      { ...newNote, noteID: Date.now() }
    ]);
  }

  function addEditNote(editNote) {
    setNotes((prevNotes) =>
      prevNotes.map((noteItem) =>
        noteItem.noteID !== editNote.id
          ? noteItem
          : { ...noteItem, title: editNote.title, content: editNote.content }
      )
    );
    setEditMode(false);
  }

  function cancelEditNote() {
    setEditMode(false);
  }

  function deleteNote(id) {
    setNotes((prevNotes) => prevNotes.filter((noteItem) => noteItem.noteID !== id));
  }

  function editNote(id) {
    const noteToEdit = notes.find((note) => note.noteID === id);
    if (noteToEdit) {
      setEditMode(true);
      setEditObject({
        id: noteToEdit.noteID,
        title: noteToEdit.title,
        content: noteToEdit.content
      });
    }
  }

  function filterNotes(searchText) {
    setSearchTerm(searchText);
  }


  if (!isMounted) return null;

  return (
    <div>
      <Header onSearch={filterNotes} />
      <CreateArea
        onAdd={addNote}
        onAddEditNote={addEditNote}
        onCancelEdit={cancelEditNote}
        {...(editMode && {
          editId: editObject.id,
          editTitle: editObject.title,
          editContent: editObject.content,
          editOn: editMode
        })}
      />
      
      <div className="notes-container">
        {filteredNotes.map((noteItem) => {
          if (editMode && noteItem.noteID === editObject.id) {
            return null;
          }
          return (
            <Note
              key={noteItem.noteID}
              id={noteItem.noteID}
              title={noteItem.title}
              content={noteItem.content}
              onDelete={deleteNote}
              onEdit={editNote}
            />
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