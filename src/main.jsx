import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// React.StrictMode intentionally omitted:
// its double-invocation of effects breaks GSAP ScrollTrigger timelines
// and the tsParticles engine initialization guard.
createRoot(document.getElementById('root')).render(<App />)
