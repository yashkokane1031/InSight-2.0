import { createRoot } from 'react-dom/client'
import './index.css'
import 'katex/dist/katex.min.css'  // Math rendering styles
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <App />
)
