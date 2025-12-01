import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <div className="content">
        <h1>404 - Page Not Found</h1>
        <p>
          <Link to="/">Go back Home</Link>
        </p>
      </div>
    </div>
  )
}
