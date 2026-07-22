import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DisableDevtool from 'disable-devtool'
import './index.css'
import App from './App.jsx'

if (import.meta.env.PROD) {
  DisableDevtool({
    disableMenu: true,
    clearIntervalWhenDevOpenTrigger: true,
    ondevtoolopen: (_type, closeWindow) => closeWindow(),
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
