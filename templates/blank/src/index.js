import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

// Render your app
if (typeof document !== 'undefined') {
  const target = document.getElementById('root')
  const renderMethod = target.hasChildNodes()
    ? ReactDOM.hydrate
    : ReactDOM.render

  const render = Comp => {
    renderMethod(<Comp />, target)
  }

  // Render!
  render(App)
}

export default App
