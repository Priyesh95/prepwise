import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header/Header'
import Footer from './components/layout/Footer/Footer'

// Import all pages
import Home from './pages/Home/Home'
import ApiKeySetup from './pages/ApiKeySetup/ApiKeySetup'
import Dashboard from './pages/Dashboard/Dashboard'
import Upload from './pages/Upload/Upload'
import Processing from './pages/Processing/Processing'
import TextPreview from './pages/TextPreview/TextPreview'
import GenerateQuestions from './pages/GenerateQuestions/GenerateQuestions'
import Configure from './pages/Configure/Configure'
import Quiz from './pages/Quiz/Quiz'
import Results from './pages/Results/Results'
import Review from './pages/Review/Review'
import Settings from './pages/Settings/Settings'
import './styles/index.css'

function App() {
  return (
    <div className="app">
      <Header />
      
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/api-setup" element={<ApiKeySetup />} />
          
          {/* Main App Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/text-preview" element={<TextPreview />} />
          <Route path="/generate-questions" element={<GenerateQuestions />} />
          <Route path="/configure/:materialId" element={<Configure />} />
          <Route path="/quiz/:quizId" element={<Quiz />} />
          <Route path="/results/:quizId" element={<Results />} />
          <Route path="/review/:materialId" element={<Review />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App