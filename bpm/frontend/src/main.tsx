import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// Styles des composants @blueprint-modular/core (rendus via la délégation du NodeRenderer)
import '@blueprint-modular/core/style.css'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
