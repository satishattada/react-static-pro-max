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

  // Hot Module Replacement
  if (module && module.hot) {
    module.hot.accept('./App', () => {
      render(App)
    })
  }
}

export default App
