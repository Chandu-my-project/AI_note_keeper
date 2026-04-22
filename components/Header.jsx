'use client'

import React from "react";
import SearchBar from "./SearchBar";
import HighlightIcon from "@mui/icons-material/Highlight";

function Header(props) {
  return (
  <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
  <h1><HighlightIcon />Keeper</h1>
  <SearchBar onSearch = {props.onSearch} />
  <div style={{ width: "100px" }}></div> 
</header>
  );
}

export default Header;
