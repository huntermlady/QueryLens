import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppLoader } from './components/AppLoader.tsx'

const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <AppLoader>
      <App />
    </AppLoader>
  </StrictMode>,
)
