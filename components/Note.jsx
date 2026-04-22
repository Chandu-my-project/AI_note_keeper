'use client'

import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

function Note(props) {
  function handleClick() {
    props.onDelete(props.id);
  }
  function handleEdit() {
    props.onEdit(props.id);
  }

  return (
    <div className="note">
      <h1>{props.title}</h1>
      <p>{props.content}</p>
      <div className="note-actions">
      <button onClick={handleEdit}>
        <EditIcon />
      </button>
      <button onClick={handleClick}>
        <DeleteIcon />
      </button>
      </div>
    </div>
  );
}

export default Note;
