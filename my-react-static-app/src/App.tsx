import React from 'react'
import { Root, ReactRoutes, addPrefetchExcludes } from 'react-static-pro-max'
import { Routes, Route, Link } from "react-router-dom";
import FancyDiv from 'components/FancyDiv'
import Dynamic from 'containers/Dynamic'

import './app.css'
import logo from './logo.png'

// Any routes that start with 'dynamic' will be treated as non-static routes
addPrefetchExcludes(['dynamic'])

function App() {
  return (
    <Root>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/dynamic">Dynamic</Link>
      </nav>
      <div className="content">
        <img src={logo} className="App-logo" alt="logo" />
        <FancyDiv>
          <React.Suspense fallback={<em>Loading...</em>}>
            <Routes>
              <Route path="/dynamic" element={<Dynamic />} />
              <Route path="*" element={<ReactRoutes />} />
            </Routes>
          </React.Suspense>
        </FancyDiv>
      </div>
    </Root>
  )
}

export default App
