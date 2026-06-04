import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.tsx'
import './App.css'

// Allow the dashboard to talk to an API hosted on a different origin (for
// example a SiteGround Node app served from api.yourdomain.com). When
// VITE_API_BASE_URL is unset, all requests stay relative to the current
// origin and rely on a same-origin reverse proxy that forwards /api to the
// backend (see DEPLOYMENT.md).
const apiBase = import.meta.env.VITE_API_BASE_URL
if (apiBase) {
  axios.defaults.baseURL = apiBase
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
