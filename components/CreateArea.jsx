'use client'

import React, { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Fab, Zoom, CircularProgress } from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function CreateArea(props) {
  const [aiError, setAiError] = useState("");
  const [isExpanded, setExpanded] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false); // New AI Loading state
  const [missingValue, setMissingValue] = useState("");

  const [note, setNote] = useState({ title: "", content: "" });
  const [editNote, setEditNote] = useState({ id: 0, title: "", content: "" });

  // Load edit data
  useEffect(() => {
    setEditNote({
      id: props.editId || 0,
      title: props.editTitle || "",
      content: props.editContent || ""
    });
  }, [props.editTitle, props.editContent]);

  useEffect(() => {
  if (isEmpty || aiError) {
    const timer = setTimeout(() => {
      setIsEmpty(false);
      setAiError("");
      setMissingValue("");
    }, 2500);

    return () => clearTimeout(timer);
  }
}, [isEmpty, aiError]);

  // AI Logic
async function handleEnhance(event) {
  console.log("Button Clicked! Attempting AI call...");
  event.preventDefault();

  setAiError(""); // ✅ clear old error

  const currentTitle = props.editOn ? editNote.title : note.title;
  const currentContent = props.editOn ? editNote.content : note.content;

  if (!currentContent && !currentTitle) return;

  setIsAiLoading(true);

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
     body: JSON.stringify({
      prompt: `Act as a professional editor. Improve the grammar, flow, and clarity of the following note content. 
  
     Instructions:
     1. Return ONLY the improved content. 
     2. Do not include any explanations, greetings, or multiple versions.
     3. Keep the original meaning and tone.
  
     Content: ${currentContent}`
     }),
    });

    const data = await response.json();

    // ✅ Handle API-level errors
    if (!response.ok) {
      if (response.status === 429) {
        setAiError("Too many requests. Please wait a moment and try again.");
      } else if (response.status === 504) {
        setAiError("AI is taking too long. Please try again.");
      } 
      else if (response.status === 503) {
        setAiError("AI is busy right now. Please try again in a few seconds.");
      }
      else {
        setAiError(data.error || "AI failed to process your request.");
      }
      return;
    }

    if (data.response) {
      if (props.editOn) {
        setEditNote(prev => ({ ...prev, content: data.response }));
      } else {
        setNote(prev => ({ ...prev, content: data.response }));
      }
    }

  } catch (error) {
    console.error("AI Enhance failed:", error);

    // ✅ Network / unexpected errors
    setAiError("Network issue or server error. Please try again.");
  } finally {
    setIsAiLoading(false);
  }
}

  function handleChange(event) {
    const { name, value } = event.target;
    if (props.editOn) {
      setEditNote(prev => ({ ...prev, [name]: value }));
    } else {
      setNote(prev => ({ ...prev, [name]: value }));
    }
  }

  // ... (Keeping your existing validate, submitNote, saveEditChanges functions here) ...
  // (You can copy them from your previous version, they remain unchanged)

  function validate() {
      var missingFields = [];
      if(props.editOn) {
          missingFields = Object.keys(editNote).filter(key => key !== "id" && editNote[key].trim() === "");
      } else {
          missingFields = Object.keys(note).filter(key => note[key].trim() === "");
      }
      if (missingFields.length === 2) setMissingValue("both title & content");
      else if (missingFields.length === 1) setMissingValue(missingFields[0]);
      else setMissingValue("");
  }

  function submitNote(event) {
    event.preventDefault();
    const isEitherEmpty = Object.values(note).some(value => value.trim() === "");
    setIsEmpty(isEitherEmpty);
    validate();
    if (!isEitherEmpty) {
      props.onAdd(note);
      setNote({ title: "", content: "" });
    }
  }

  function saveEditChanges(event) {
    event.preventDefault();
    const isEitherEmpty = editNote.title.trim() === "" || editNote.content.trim() === "";
    setIsEmpty(isEitherEmpty);
    validate();
    if (!isEitherEmpty) {
      props.onAddEditNote(editNote);
      setEditNote({ id: 0, title: "", content: "" });
    }
  }

  function cancelEditChanges(event) {
    event.preventDefault();
    props.onCancelEdit();
    setEditNote({ id: 0, title: "", content: "" });
  }

  function expand() { setExpanded(true); }

  return (
    <div className="create-area">
      <form className="create-note">
        {props.editOn ? (
          <>
            <input name="title" onChange={handleChange} value={editNote.title} placeholder="Title" />
            <textarea name="content" onChange={handleChange} value={editNote.content} placeholder="Take a note..." rows={3} />
            <div className="editOptions">
  <Fab onClick={saveEditChanges} variant="extended">Save</Fab>
  <Fab onClick={cancelEditChanges} variant="extended">Cancel</Fab>
  

  <Fab 
    type="button" 
    className="ai-btn"
    onClick={handleEnhance} 
    disabled={isAiLoading}
  >
    {isAiLoading ? (
      <CircularProgress size={20} style={{ color: 'white' }} />
    ) : (

      <AutoAwesomeIcon sx={{ color: 'white', fontSize: 20 }} />
    )}
  </Fab>
</div>
          </>
        ) : (
          <>
            {isExpanded && <input name="title" onChange={handleChange} value={note.title} placeholder="Title" />}
            <textarea name="content" onClick={expand} onChange={handleChange} value={note.content} placeholder="Take a note..." rows={isExpanded ? 3 : 1} />
   <Zoom in={isExpanded}>
  <div className="button-container">
    {/* AI Button first (so it appears on the left) */}
    <Fab 
      className="ai-fab" 
      onClick={handleEnhance} 
      disabled={isAiLoading} 
      size="small" 
    >
      {isAiLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
    </Fab>

    {/* Add Button second (so it appears on the right) */}
    <Fab className="addButton" onClick={submitNote}>
      <AddIcon />
    </Fab>
  </div>
</Zoom>
          </>
        )}
      </form>
      {isEmpty && <div className="error-message"> <ErrorOutlineIcon style={{ fontSize: "1.25rem", marginRight: "8px", verticalAlign: "middle" }} /><span>You gotta type {missingValue}!</span> </div>}
      {aiError && (  <div className="error-message">    <ErrorOutlineIcon       style={{ fontSize: "1.25rem", marginRight: "8px", verticalAlign: "middle" }}     />    <span>{aiError}</span>  </div>)}
    </div>
  );
}

export default CreateArea;