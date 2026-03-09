import { Routes, Route, useParams } from 'react-router-dom'
import HospitalCapilarQuiz from './components/HospitalCapilarQuiz'
import QuizRenderer from './components/QuizRenderer'
import QuizPreview from './components/QuizPreview'
import './App.css'

// Dynamic quiz page that reads from Firestore
function DynamicQuizPage() {
  const { slug } = useParams()
  return <QuizRenderer slug={slug} />
}

// Preview page - loads by slug, works for drafts
function PreviewPage() {
  const { slug } = useParams()
  return <QuizPreview slug={slug} />
}

function App() {
  return (
    <Routes>
      {/* Hospital Capilar Quiz — generic */}
      <Route path="/" element={<HospitalCapilarQuiz />} />

      {/* Niche quiz — direct start, no landing page */}
      <Route path="/mujeres" element={<HospitalCapilarQuiz nicho="mujeres" />} />
      <Route path="/jovenes" element={<HospitalCapilarQuiz nicho="jovenes" />} />
      <Route path="/hombres-caida" element={<HospitalCapilarQuiz nicho="hombres-caida" />} />
      <Route path="/segunda-opinion" element={<HospitalCapilarQuiz nicho="segunda-opinion" />} />
      <Route path="/post-trasplante" element={<HospitalCapilarQuiz nicho="post-trasplante" />} />
      <Route path="/postparto" element={<HospitalCapilarQuiz nicho="postparto" />} />

      {/* Preview mode */}
      <Route path="/preview/:slug" element={<PreviewPage />} />

      {/* Dynamic quizzes from Firestore */}
      <Route path="/q/:slug" element={<DynamicQuizPage />} />
    </Routes>
  )
}

export default App
