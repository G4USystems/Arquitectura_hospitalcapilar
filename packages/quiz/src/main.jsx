import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PostHogProvider, AnalyticsProvider } from '@hospital-capilar/shared/analytics'
import './index.css'
import App from './App.jsx'

// Render app with PostHog analytics
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostHogProvider>
      <AnalyticsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AnalyticsProvider>
    </PostHogProvider>
  </StrictMode>,
)
