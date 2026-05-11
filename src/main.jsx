import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import FabSealed from './fab-sealed.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FabSealed />
  </StrictMode>,
)