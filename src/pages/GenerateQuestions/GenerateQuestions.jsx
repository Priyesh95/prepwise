import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuestionGeneration } from '../../hooks/useQuestionGeneration'
import { getMaterial, saveMaterial, saveQuiz } from '../../utils/indexedDB'
import Container from '../../components/layout/Container/Container'
import Card from '../../components/common/Card/Card'
import Button from '../../components/common/Button/Button'
import './GenerateQuestions.css'

function GenerateQuestions() {
  const navigate = useNavigate()
  const location = useLocation()
  const { generateQuestions, isGenerating } = useQuestionGeneration()

  const [material, setMaterial] = useState(null)
  const [status, setStatus] = useState('loading') // loading, generating, success, error
  const [progress, setProgress] = useState({ step: 0, total: 3, message: '' })
  const [generatedQuestions, setGeneratedQuestions] = useState(null)
  const [error, setError] = useState('')

  // Get materialId from navigation state
  const materialId = location.state?.materialId

  // Load material on mount
  useEffect(() => {
    if (!materialId) {
      setStatus('error')
      setError('No material ID provided. Please upload a PDF first.')
      return
    }

    loadMaterial()
  }, [materialId])

  const loadMaterial = async () => {
    try {
      const loadedMaterial = await getMaterial(materialId)

      if (!loadedMaterial) {
        setStatus('error')
        setError('Material not found. Please try uploading again.')
        return
      }

      if (!loadedMaterial.extractedText) {
        setStatus('error')
        setError('No text found in material. Please process the PDF first.')
        return
      }

      setMaterial(loadedMaterial)
      setStatus('ready')
    } catch (err) {
      console.error('Error loading material:', err)
      setStatus('error')
      setError('Failed to load material. Please try again.')
    }
  }

  // Auto-start generation when material is loaded
  useEffect(() => {
    if (status === 'ready' && material) {
      handleGenerateQuestions()
    }
  }, [status, material])

  const handleGenerateQuestions = async () => {
    if (!material || !material.extractedText) {
      setError('No text available to generate questions from.')
      return
    }

    setStatus('generating')
    setError('')

    try {
      const result = await generateQuestions(material.extractedText, {
        onProgress: (step, total, message) => {
          setProgress({ step, total, message })
        },
        counts: {
          mcq: 1,
          singleWord: 1,
          shortAnswer: 1,
        },
      })

      if (result.success) {
        setGeneratedQuestions(result.questions)
        setStatus('success')

        // Save questionBank to material
        const updatedMaterial = {
          ...material,
          questionBank: {
            mcq: result.questions.mcq || [],
            singleWord: result.questions.singleWord || [],
            shortAnswer: result.questions.shortAnswer || [],
            totalQuestions: result.counts.total
          }
        }
        await saveMaterial(updatedMaterial)

        // Save quiz to IndexedDB
        await saveQuiz({
          materialId: material.id,
          materialName: material.fileName,
          questions: result.questions,
          status: 'draft',
        })

        // Auto-navigate to configure page after brief delay
        setTimeout(() => {
          navigate(`/configure/${material.id}`)
        }, 2000)
      } else {
        setStatus('error')
        setError(result.error || 'Failed to generate questions. Please try again.')
      }
    } catch (err) {
      console.error('Error generating questions:', err)
      setStatus('error')
      setError('An unexpected error occurred. Please try again.')
    }
  }

  const handleRetry = () => {
    setStatus('ready')
    handleGenerateQuestions()
  }

  const handleBack = () => {
    navigate('/dashboard')
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="generate-questions">
        <Container narrow>
          <Card>
            <div className="generate-questions__content">
              <div className="status-icon">⏳</div>
              <h2>Loading Material...</h2>
              <p className="status-message">Please wait while we load your study material.</p>
            </div>
          </Card>
        </Container>
      </div>
    )
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="generate-questions">
        <Container narrow>
          <Card>
            <div className="generate-questions__content">
              <div className="status-icon error">⚠️</div>
              <h2>Generation Failed</h2>
              <p className="error-message">{error}</p>
              <div className="actions">
                <Button variant="primary" onClick={handleRetry}>
                  Try Again
                </Button>
                <Button variant="ghost" onClick={handleBack}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </Container>
      </div>
    )
  }

  // Generating state
  if (status === 'generating' || status === 'ready') {
    return (
      <div className="generate-questions">
        <Container narrow>
          <Card>
            <div className="generate-questions__content">
              <div className="status-icon generating">🤖</div>
              <h2>Generating Questions</h2>
              <p className="subtitle">
                AI is analyzing your study material and creating personalized quiz questions...
              </p>

              {/* Progress Steps */}
              <div className="progress-steps">
                <div className={`progress-step ${progress.step >= 1 ? 'active' : ''} ${progress.step > 1 ? 'completed' : ''}`}>
                  <div className="step-number">1</div>
                  <div className="step-label">Multiple Choice</div>
                  <div className="step-detail">20 questions</div>
                </div>
                <div className={`progress-step ${progress.step >= 2 ? 'active' : ''} ${progress.step > 2 ? 'completed' : ''}`}>
                  <div className="step-number">2</div>
                  <div className="step-label">Single Word</div>
                  <div className="step-detail">15 questions</div>
                </div>
                <div className={`progress-step ${progress.step >= 3 ? 'active' : ''} ${progress.step > 3 ? 'completed' : ''}`}>
                  <div className="step-number">3</div>
                  <div className="step-label">Short Answer</div>
                  <div className="step-detail">10 questions</div>
                </div>
              </div>

              {/* Progress Message */}
              {progress.message && (
                <div className="progress-message">
                  <div className="spinner"></div>
                  <p>{progress.message}</p>
                </div>
              )}

              {/* Material Info */}
              <div className="material-info">
                <p>
                  <strong>Material:</strong> {material?.fileName}
                </p>
                <p>
                  <strong>Pages:</strong> {material?.pageCount || 0}
                </p>
              </div>
            </div>
          </Card>

          {/* Info Box */}
          <div className="info-box">
            <h3>💡 What's Happening?</h3>
            <ul>
              <li>AI is reading and understanding your study material</li>
              <li>Creating questions that test different levels of understanding</li>
              <li>Generating explanations for each answer</li>
              <li>This may take 1-2 minutes depending on document length</li>
            </ul>
          </div>
        </Container>
      </div>
    )
  }

  // Success state
  if (status === 'success') {
    const totalQuestions =
      (generatedQuestions?.mcq?.length || 0) +
      (generatedQuestions?.singleWord?.length || 0) +
      (generatedQuestions?.shortAnswer?.length || 0)

    return (
      <div className="generate-questions">
        <Container narrow>
          <Card>
            <div className="generate-questions__content">
              <div className="status-icon success">✅</div>
              <h2>Questions Generated Successfully!</h2>
              <p className="success-message">
                Created {totalQuestions} personalized quiz questions from your study material.
              </p>

              {/* Question Breakdown */}
              <div className="question-breakdown">
                <div className="breakdown-item">
                  <div className="breakdown-icon">📝</div>
                  <div className="breakdown-label">Multiple Choice</div>
                  <div className="breakdown-count">{generatedQuestions?.mcq?.length || 0}</div>
                </div>
                <div className="breakdown-item">
                  <div className="breakdown-icon">💬</div>
                  <div className="breakdown-label">Single Word</div>
                  <div className="breakdown-count">{generatedQuestions?.singleWord?.length || 0}</div>
                </div>
                <div className="breakdown-item">
                  <div className="breakdown-icon">📄</div>
                  <div className="breakdown-label">Short Answer</div>
                  <div className="breakdown-count">{generatedQuestions?.shortAnswer?.length || 0}</div>
                </div>
              </div>

              <p className="redirect-message">Redirecting to configuration...</p>
            </div>
          </Card>
        </Container>
      </div>
    )
  }

  return null
}

export default GenerateQuestions
