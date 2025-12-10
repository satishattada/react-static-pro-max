import React from 'react'
import ReactDOM from 'react-dom/client'

// Your top level component
import App from './App'

// Export App for SSR
export default App

// Only run in browser
if (typeof document !== 'undefined') {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
