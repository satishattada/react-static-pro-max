import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <div className="content">
        <h1>About</h1>
        <p>This is the about page.</p>
        <p>
          <Link to="/">Go back Home</Link>
        </p>
      </div>
    </div>
  );
}
