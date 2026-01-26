import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ApiKeyProvider } from './context/ApiKeyContext/ApiKeyContext'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ApiKeyProvider>
        <App />
      </ApiKeyProvider>
    </BrowserRouter>
  </React.StrictMode>,
)