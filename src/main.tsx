import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/noto-sans-thai'
import './styles/app.css'
import App from './app/App'

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)

if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => { void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`) })
