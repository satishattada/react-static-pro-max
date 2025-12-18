import React from 'react'
import { Root, Routes } from 'react-static-pro-max'
import { BrowserRouter } from 'react-router'

import './app.css'

function App() {
  return (
    <Root>
      <React.Suspense fallback={<em>Loading...</em>}>
        <BrowserRouter>
          <Routes path="*" />
        </BrowserRouter>
      </React.Suspense>
    </Root>
  )
}

export default App
