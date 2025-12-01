import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <div className="content">
        <h1>Welcome to React Static Pro Max!</h1>
        <p>This is a basic starter template.</p>
        <p>
          <Link to="/about">Go to About Page</Link>
        </p>
      </div>
    </div>
  );
}
