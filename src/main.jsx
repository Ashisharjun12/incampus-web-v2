import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './components/ui/theme-provider.jsx'
import { Toaster } from 'sonner'

// Welcome message
console.log('🎉 Happy to see you use Incampus! If any problem, kindly contact ashishrahul748@gmail.com');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
    <BrowserRouter>
      <App />
      <Toaster 
        
      />
    </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)