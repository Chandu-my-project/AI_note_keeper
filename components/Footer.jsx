'use client' // Required for hooks

import React, { useState, useEffect } from "react";

function Footer() {
  
  return (
    <footer>
      {/* 3. Render nothing or a placeholder if year is not loaded yet */}
      <p>Copyright ⓒ 2026</p>
    </footer>
  );
}

export default Footer;