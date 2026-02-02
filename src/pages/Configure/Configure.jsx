import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { getMaterial } from '../../utils/indexedDB'
import { useQuiz } from '../../context/QuizContext/QuizContext'
import Container from '../../components/layout/Container/Container'
import Card from '../../components/common/Card/Card'
import Button from '../../components/common/Button/Button'
import './Configure.css'

function Configure() {
  const navigate = useNavigate()
  const { materialId } = useParams()
  const location = useLocation()
  const { initializeQuiz } = useQuiz()

  // Check if in review mode
  const reviewMode = location.state?.mode === 'review'
  const reviewQuestionIds = location.state?.questionIds || []

  const [material, setMaterial] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Question configuration
  const [mcqCount, setMcqCount] = useState(10)
  const [singleWordCount, setSingleWordCount] = useState(5)
  const [shortAnswerCount, setShortAnswerCount] = useState(3)

  // Timer configuration
  const [enableTimer, setEnableTimer] = useState(true)
  const [timerMinutes, setTimerMinutes] = useState(45)

  useEffect(() => {
    if (!materialId) {
      navigate('/upload')
      return
    }

    loadMaterial()
  }, [materialId])

  const getAllQuestionsFromBank = (questionBank) => {
    return [
      ...questionBank.mcq,
      ...questionBank.singleWord,
      ...questionBank.shortAnswer
    ]
  }

  const loadMaterial = async () => {
    try {
      const data = await getMaterial(materialId)

      if (!data) {
        setError('Material not found')
        return
      }

      if (!data.questionBank) {
        setError('No questions generated for this material')
        return
      }

      setMaterial(data)

      // If review mode, set counts based on review questions
      if (reviewMode && reviewQuestionIds.length > 0) {
        const reviewQuestions = getAllQuestionsFromBank(data.questionBank)
          .filter(q => reviewQuestionIds.includes(q.id))

        const mcqReview = reviewQuestions.filter(q => q.type === 'mcq').length
        const singleReview = reviewQuestions.filter(q => q.type === 'singleWord').length
        const shortReview = reviewQuestions.filter(q => q.type === 'shortAnswer').length

        setMcqCount(mcqReview)
        setSingleWordCount(singleReview)
        setShortAnswerCount(shortReview)
        setEnableTimer(false) // No timer for review
      } else {
        // Normal mode - Set max values based on available questions
        const maxMCQ = data.questionBank.mcq.length
        const maxSingle = data.questionBank.singleWord.length
        const maxShort = data.questionBank.shortAnswer.length

        // Set initial values to half of available
        setMcqCount(Math.min(10, Math.floor(maxMCQ / 2)))
        setSingleWordCount(Math.min(5, Math.floor(maxSingle / 2)))
        setShortAnswerCount(Math.min(3, Math.floor(maxShort / 2)))
      }

    } catch (err) {
      console.error('Error loading material:', err)
      setError('Failed to load material')
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalQuestions = () => {
    return mcqCount + singleWordCount + shortAnswerCount
  }

  const getEstimatedTime = () => {
    // Estimate: MCQ=1min, Single=1.5min, Short=3min
    const estimated = (mcqCount * 1) + (singleWordCount * 1.5) + (shortAnswerCount * 3)
    return Math.ceil(estimated)
  }

  const handleStartQuiz = () => {
    if (getTotalQuestions() === 0) {
      alert('Please select at least one question')
      return
    }

    let allQuestions

    if (reviewMode && reviewQuestionIds.length > 0) {
      // Review mode - use specific questions
      const allBankQuestions = getAllQuestionsFromBank(material.questionBank)
      allQuestions = allBankQuestions.filter(q => reviewQuestionIds.includes(q.id))
    } else {
      // Normal mode - select random questions from each type
      const selectedMCQ = getRandomQuestions(material.questionBank.mcq, mcqCount)
      const selectedSingleWord = getRandomQuestions(material.questionBank.singleWord, singleWordCount)
      const selectedShortAnswer = getRandomQuestions(material.questionBank.shortAnswer, shortAnswerCount)

      allQuestions = [
        ...selectedMCQ,
        ...selectedSingleWord,
        ...selectedShortAnswer
      ]
    }

    // Check if all questions have IDs
    const questionsWithoutIds = allQuestions.filter(q => !q.id)
    if (questionsWithoutIds.length > 0) {
      alert(`Error: ${questionsWithoutIds.length} questions are missing unique IDs. This material uses an old version of questions. Please delete this material and upload it again to regenerate questions with the latest format.`)
      return
    }

    const shuffledQuestions = shuffleArray(allQuestions)

    // Initialize quiz
    const quiz = initializeQuiz({
      materialId,
      questions: shuffledQuestions,
      mcqCount,
      singleWordCount,
      shortAnswerCount,
      timeLimit: enableTimer ? timerMinutes * 60 : null // Convert to seconds
    })

    // Navigate to quiz page
    navigate(`/quiz/${quiz.id}`)
  }

  const getRandomQuestions = (questions, count) => {
    const shuffled = shuffleArray([...questions])
    return shuffled.slice(0, count)
  }

  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  if (isLoading) {
    return (
      <div className="configure">
        <Container narrow>
          <Card>
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading question bank...</p>
            </div>
          </Card>
        </Container>
      </div>
    )
  }

  if (error || !material) {
    return (
      <div className="configure">
        <Container narrow>
          <Card>
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h2>Error</h2>
              <p>{error || 'Material not found'}</p>
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    )
  }

  const questionBank = material.questionBank
  const maxMCQ = questionBank.mcq.length
  const maxSingleWord = questionBank.singleWord.length
  const maxShortAnswer = questionBank.shortAnswer.length

  return (
    <div className="configure">
      <Container narrow>
        <div className="configure__header">
          <h1>Configure Your Quiz</h1>
          <p className="configure__subtitle">
            Choose how many questions you want for each type.
            We generated {questionBank.totalQuestions} questions from your material.
          </p>
        </div>

        <Card>
          <div className="configure__content">
            {/* Material Info */}
            <div className="material-summary">
              <h3>📄 {material.fileName}</h3>
              <p>
                {questionBank.totalQuestions} questions available •
                {material.pageCount} pages •
                {material.totalWords.toLocaleString()} words
              </p>
            </div>

            <div className="divider"></div>

            {/* Question Type Selectors */}
            <div className="question-selectors">
              <h3>Select Question Types</h3>

              {/* MCQ Selector */}
              <div className="selector-group">
                <div className="selector-header">
                  <label htmlFor="mcq-slider" className="selector-label">
                    📝 Multiple Choice Questions
                  </label>
                  <span className="selector-count">
                    {mcqCount} / {maxMCQ} available
                  </span>
                </div>

                <input
                  id="mcq-slider"
                  type="range"
                  min="0"
                  max={maxMCQ}
                  value={mcqCount}
                  onChange={(e) => setMcqCount(parseInt(e.target.value))}
                  className="slider"
                />

                <div className="selector-footer">
                  <span className="selector-info">~1 min each</span>
                </div>
              </div>

              {/* Single Word Selector */}
              <div className="selector-group">
                <div className="selector-header">
                  <label htmlFor="single-slider" className="selector-label">
                    💬 Single Word Answers
                  </label>
                  <span className="selector-count">
                    {singleWordCount} / {maxSingleWord} available
                  </span>
                </div>

                <input
                  id="single-slider"
                  type="range"
                  min="0"
                  max={maxSingleWord}
                  value={singleWordCount}
                  onChange={(e) => setSingleWordCount(parseInt(e.target.value))}
                  className="slider"
                />

                <div className="selector-footer">
                  <span className="selector-info">~1.5 min each</span>
                </div>
              </div>

              {/* Short Answer Selector */}
              <div className="selector-group">
                <div className="selector-header">
                  <label htmlFor="short-slider" className="selector-label">
                    📄 Short Answer Questions
                  </label>
                  <span className="selector-count">
                    {shortAnswerCount} / {maxShortAnswer} available
                  </span>
                </div>

                <input
                  id="short-slider"
                  type="range"
                  min="0"
                  max={maxShortAnswer}
                  value={shortAnswerCount}
                  onChange={(e) => setShortAnswerCount(parseInt(e.target.value))}
                  className="slider"
                />

                <div className="selector-footer">
                  <span className="selector-info">~3 min each</span>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            {/* Timer Configuration */}
            <div className="timer-config">
              <h3>Time Limit</h3>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={enableTimer}
                  onChange={(e) => setEnableTimer(e.target.checked)}
                />
                <span>Enable time limit</span>
              </label>

              {enableTimer && (
                <div className="timer-options">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="timer"
                      value="30"
                      checked={timerMinutes === 30}
                      onChange={() => setTimerMinutes(30)}
                    />
                    <span>30 minutes</span>
                  </label>

                  <label className="radio-label">
                    <input
                      type="radio"
                      name="timer"
                      value="45"
                      checked={timerMinutes === 45}
                      onChange={() => setTimerMinutes(45)}
                    />
                    <span>45 minutes (default)</span>
                  </label>

                  <label className="radio-label">
                    <input
                      type="radio"
                      name="timer"
                      value="custom"
                      checked={![30, 45].includes(timerMinutes)}
                      onChange={() => setTimerMinutes(60)}
                    />
                    <span>Custom:</span>
                    {![30, 45].includes(timerMinutes) && (
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={timerMinutes}
                        onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 30)}
                        className="custom-timer-input"
                      />
                    )}
                    <span>minutes</span>
                  </label>
                </div>
              )}
            </div>

            <div className="divider"></div>

            {/* Quiz Summary */}
            <div className="quiz-summary">
              <h3>Quiz Summary</h3>

              <div className="summary-stats">
                <div className="summary-stat">
                  <span className="stat-label">Total Questions:</span>
                  <span className="stat-value">{getTotalQuestions()}</span>
                </div>

                <div className="summary-stat">
                  <span className="stat-label">Estimated Time:</span>
                  <span className="stat-value">~{getEstimatedTime()} minutes</span>
                </div>

                {enableTimer && (
                  <div className="summary-stat">
                    <span className="stat-label">Time Limit:</span>
                    <span className="stat-value">{timerMinutes} minutes</span>
                  </div>
                )}
              </div>

              {getTotalQuestions() === 0 && (
                <div className="warning-message">
                  ⚠️ Please select at least one question to start the quiz
                </div>
              )}
            </div>

            {/* Start Quiz Button */}
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={handleStartQuiz}
              disabled={getTotalQuestions() === 0}
            >
              Start Quiz ({getTotalQuestions()} questions)
            </Button>

            {/* Back to Dashboard */}
            <div className="back-action">
              <button
                onClick={() => navigate('/dashboard')}
                className="back-link"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  )
}

export default Configure
