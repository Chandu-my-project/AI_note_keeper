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
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [missingValue, setMissingValue] = useState("");

  const [note, setNote] = useState({ title: "", content: "" });

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

  async function handleEnhance(event) {
    event.preventDefault();
    setAiError("");

    const currentTitle = props.editOn ? props.editTitle : note.title;
    const currentContent = props.editOn ? props.editContent : note.content;

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

      if (!response.ok) {
        if (response.status === 429) {
          setAiError("Too many requests. Please wait a moment and try again.");
        } else if (response.status === 504) {
          setAiError("AI is taking too long. Please try again.");
        } else if (response.status === 503) {
          setAiError("AI is busy right now. Please try again in a few seconds.");
        } else {
          setAiError(data.error || "AI failed to process your request.");
        }
        return;
      }

      if (data.response) {
        props.onEditChange("content", data.response);
      }
    } catch (error) {
      setAiError("Network issue or server error. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    if (props.editOn) {
      props.onEditChange(name, value);
    } else {
      setNote(prev => ({ ...prev, [name]: value }));
    }
  }

  function submitNote(event) {
    event.preventDefault();
    const isEitherEmpty = Object.values(note).some(value => value.trim() === "");
    if (isEitherEmpty) {
      setIsEmpty(true);
      setMissingValue("both title & content");
    } else {
      props.onAdd(note);
      setNote({ title: "", content: "" });
    }
  }

  function saveEditChanges(event) {
    event.preventDefault();
    const isEitherEmpty = props.editTitle.trim() === "" || props.editContent.trim() === "";
    
    if (isEitherEmpty) {
      setIsEmpty(true);
      setMissingValue("both title & content");
    } else {
      props.onAddEditNote({ id: props.editId, title: props.editTitle, content: props.editContent });
    }
  }

  function cancelEditChanges(event) {
    event.preventDefault();
    props.onCancelEdit();
  }

  function expand() { setExpanded(true); }

  return (
    <div className="create-area">
      <form className="create-note">
        {props.editOn ? (
          <>
            <input name="title" onChange={handleChange} value={props.editTitle} placeholder="Title" />
            <textarea name="content" onChange={handleChange} value={props.editContent} placeholder="Take a note..." rows={3} />
            <div className="editOptions">
              <Fab onClick={saveEditChanges} variant="extended">Save</Fab>
              <Fab onClick={cancelEditChanges} variant="extended">Cancel</Fab>
              <Fab type="button" className="ai-btn" onClick={handleEnhance} disabled={isAiLoading}>
                {isAiLoading ? <CircularProgress size={20} style={{ color: 'white' }} /> : <AutoAwesomeIcon sx={{ color: 'white', fontSize: 20 }} />}
              </Fab>
            </div>
          </>
        ) : (
          <>
            {isExpanded && <input name="title" onChange={handleChange} value={note.title} placeholder="Title" />}
            <textarea name="content" onClick={expand} onChange={handleChange} value={note.content} placeholder="Take a note..." rows={isExpanded ? 3 : 1} />
            <Zoom in={isExpanded}>
              <div className="button-container">
                <Fab className="ai-fab" onClick={handleEnhance} disabled={isAiLoading} size="small">
                  {isAiLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                </Fab>
                <Fab className="addButton" onClick={submitNote}>
                  <AddIcon />
                </Fab>
              </div>
            </Zoom>
          </>
        )}
      </form>
      {isEmpty && <div className="error-message"> <ErrorOutlineIcon style={{ fontSize: "1.25rem", marginRight: "8px", verticalAlign: "middle" }} /><span>You gotta type {missingValue}!</span> </div>}
      {aiError && <div className="error-message"> <ErrorOutlineIcon style={{ fontSize: "1.25rem", marginRight: "8px", verticalAlign: "middle" }} /> <span>{aiError}</span> </div>}
    </div>
  );
}

export default CreateArea;