'use client'

import React, { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";

function SearchBar(props) {
  const [inputText, setInputText]  = useState("");

  useEffect(()=>{
      props.onSearch(inputText);
  },[inputText]);

  function handleOnChange(event) {
    const value = event.target.value;
    setInputText(value);
  }

  return (
    <div className="search-container">
      <div className="search-box">
        <SearchIcon className="search-icon" />
        <input
          type="text"
          placeholder="Search your notes..."
          className="search-input"
          onChange={handleOnChange}
    
        />
      </div>
    </div>
  );
}

export default SearchBar;