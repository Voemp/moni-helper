import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import appIcon from './assets/app_icon.svg'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className={'titleBar'}>
      <h5>Moni</h5>
      <img src={appIcon} alt={'logo'} />
      <h5>Helper</h5>
    </div>
    <App />
  </StrictMode>
)
