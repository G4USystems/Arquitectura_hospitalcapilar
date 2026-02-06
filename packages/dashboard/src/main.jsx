import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@hospital-capilar/shared/hooks'
import { AnalyticsProvider } from '@hospital-capilar/shared/analytics'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AnalyticsProvider>
          <App />
        </AnalyticsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
