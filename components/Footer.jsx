'use client' // Required for hooks

import React, { useState, useEffect } from "react";

function Footer() {
  const [year, setYear] = useState(null); // 1. Start with null (Server will render null)

  useEffect(() => {
    // 2. This only runs on the client. 
    // Now Server and Client match (both are null initially).
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer>
      {/* 3. Render nothing or a placeholder if year is not loaded yet */}
      <p>Copyright ⓒ {year || ""}</p>
    </footer>
  );
}

export default Footer;