import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuiz } from '../../context/QuizContext/QuizContext'
import { getMaterial, saveCompletedQuiz } from '../../utils/indexedDB'
import Container from '../../components/layout/Container/Container'
import Card from '../../components/common/Card/Card'
import Button from '../../components/common/Button/Button'
import './Results.css'

function Results() {
  const navigate = useNavigate()
  const { quizId } = useParams()
  const { activeQuiz, clearQuiz } = useQuiz()

  const [material, setMaterial] = useState(null)
  const [results, setResults] = useState(null)
  const [quizData, setQuizData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAllQuestions, setShowAllQuestions] = useState(false)

  useEffect(() => {
    // Always load from localStorage to ensure we have the complete quiz with answers
    const saved = localStorage.getItem('activeQuiz')
    if (saved) {
      const quiz = JSON.parse(saved)
      if (quiz.id === quizId && quiz.status === 'completed') {
        loadResults(quiz)
      } else {
        navigate('/dashboard')
      }
    } else {
      navigate('/dashboard')
    }
  }, [])

  const loadResults = async (quiz) => {
    try {
      // Check if questions have IDs
      const questionsWithoutIds = quiz.questions.filter(q => !q.id)
      if (questionsWithoutIds.length > 0) {
        console.error('WARNING: Found questions without IDs:', questionsWithoutIds.length, 'out of', quiz.questions.length)
        alert('Error: This quiz uses old questions without unique IDs. Please delete the material and regenerate questions to fix this issue.')
        navigate('/dashboard')
        return
      }

      // Save quiz to IndexedDB
      const savedQuiz = await saveCompletedQuiz(quiz)

      // Load material info
      const materialData = await getMaterial(quiz.materialId)
      setMaterial(materialData)

      // Set quiz data and results
      setQuizData(savedQuiz)
      setResults(savedQuiz.results)
    } catch (error) {
      console.error('Error loading results:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'score--excellent'
    if (score >= 70) return 'score--good'
    if (score >= 60) return 'score--passing'
    return 'score--needs-work'
  }

  const getScoreLabel = (score) => {
    if (score >= 90) return '🌟 Excellent!'
    if (score >= 80) return '✨ Great Job!'
    if (score >= 70) return '👍 Good Work!'
    if (score >= 60) return '📚 Keep Practicing'
    return '💪 Needs More Study'
  }

  const getWrongAnswers = () => {
    if (!quizData) return []

    return quizData.questions.filter(q => {
      const answer = quizData.answers[q.id]
      return answer && !answer.isCorrect && !answer.skipped
    })
  }

  const formatDuration = (start, end) => {
    const diff = new Date(end) - new Date(start)
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleRetakeQuiz = () => {
    if (window.confirm('Start a new quiz with the same material?')) {
      clearQuiz()
      navigate(`/configure/${quizData.materialId}`)
    }
  }

  const handleReviewMistakes = () => {
    const wrongAnswers = getWrongAnswers()
    if (wrongAnswers.length === 0) {
      alert('You got all questions correct! Nothing to review.')
      return
    }

    // Store wrong answer IDs for review page
    localStorage.setItem('reviewQuestions', JSON.stringify({
      materialId: quizData.materialId,
      questionIds: wrongAnswers.map(q => q.id)
    }))

    navigate(`/review/${quizData.materialId}`)
  }

  const handleBackToDashboard = () => {
    clearQuiz()
    navigate('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="results">
        <Container narrow>
          <Card>
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Calculating results...</p>
            </div>
          </Card>
        </Container>
      </div>
    )
  }

  if (!results || !quizData) {
    return (
      <div className="results">
        <Container narrow>
          <Card>
            <div className="error-state">
              <h2>Results not found</h2>
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    )
  }

  const wrongAnswersCount = getWrongAnswers().length

  return (
    <div className="results">
      <Container narrow>
        {/* Results Header */}
        <div className="results__header">
          <h1>Quiz Complete! 🎉</h1>
          <p className="results__subtitle">
            Here's how you performed
          </p>
        </div>

        {/* Overall Score */}
        <Card>
          <div className={`overall-score ${getScoreColor(results.totalScore)}`}>
            <div className="score-circle">
              <span className="score-value">{results.totalScore}%</span>
              <span className="score-label">{getScoreLabel(results.totalScore)}</span>
            </div>

            <div className="score-stats">
              <div className="stat">
                <span className="stat-value">{results.correctCount}</span>
                <span className="stat-label">Correct</span>
              </div>
              <div className="stat">
                <span className="stat-value">{results.incorrectCount}</span>
                <span className="stat-label">Incorrect</span>
              </div>
              {results.skippedCount > 0 && (
                <div className="stat">
                  <span className="stat-value">{results.skippedCount}</span>
                  <span className="stat-label">Skipped</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Quiz Info */}
        <Card>
          <div className="quiz-info">
            <h3>Quiz Details</h3>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Material:</span>
                <span className="info-value">{material?.fileName || 'N/A'}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Total Questions:</span>
                <span className="info-value">{results.totalQuestions}</span>
              </div>

              {quizData.timeLimit && (
                <div className="info-item">
                  <span className="info-label">Time Taken:</span>
                  <span className="info-value">
                    {formatDuration(quizData.startedAt, quizData.completedAt)}
                  </span>
                </div>
              )}

              <div className="info-item">
                <span className="info-label">Date:</span>
                <span className="info-value">
                  {new Date(quizData.completedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Breakdown by Question Type */}
        <Card>
          <div className="type-breakdown">
            <h3>Performance by Question Type</h3>

            <div className="type-stats">
              {/* MCQ */}
              {results.byType.mcq.total > 0 && (
                <div className="type-stat">
                  <div className="type-stat__header">
                    <span className="type-stat__name">📝 Multiple Choice</span>
                    <span className="type-stat__score">{results.byType.mcq.avgScore}%</span>
                  </div>
                  <div className="type-stat__details">
                    {results.byType.mcq.correct}/{results.byType.mcq.total} correct
                  </div>
                  <div className="progress-bar-small">
                    <div
                      className="progress-bar-small__fill"
                      style={{ width: `${results.byType.mcq.percentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Single Word */}
              {results.byType.singleWord.total > 0 && (
                <div className="type-stat">
                  <div className="type-stat__header">
                    <span className="type-stat__name">💬 Single Word</span>
                    <span className="type-stat__score">{results.byType.singleWord.avgScore}%</span>
                  </div>
                  <div className="type-stat__details">
                    {results.byType.singleWord.correct}/{results.byType.singleWord.total} correct
                  </div>
                  <div className="progress-bar-small">
                    <div
                      className="progress-bar-small__fill"
                      style={{ width: `${results.byType.singleWord.percentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Short Answer */}
              {results.byType.shortAnswer.total > 0 && (
                <div className="type-stat">
                  <div className="type-stat__header">
                    <span className="type-stat__name">📄 Short Answer</span>
                    <span className="type-stat__score">{results.byType.shortAnswer.avgScore}%</span>
                  </div>
                  <div className="type-stat__details">
                    {results.byType.shortAnswer.correct}/{results.byType.shortAnswer.total} correct
                  </div>
                  <div className="progress-bar-small">
                    <div
                      className="progress-bar-small__fill"
                      style={{ width: `${results.byType.shortAnswer.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Concept Mastery */}
        {Object.keys(results.conceptScores).length > 0 && (
          <Card>
            <div className="concept-mastery">
              <h3>Topic Mastery</h3>

              <div className="concepts-list">
                {Object.entries(results.conceptScores)
                  .sort((a, b) => b[1].percentage - a[1].percentage)
                  .slice(0, 5)
                  .map(([concept, data]) => (
                    <div key={concept} className="concept-item">
                      <div className="concept-item__header">
                        <span className="concept-name">{concept}</span>
                        <span className={`concept-score ${data.percentage >= 80 ? 'concept-score--good' : data.percentage >= 60 ? 'concept-score--ok' : 'concept-score--weak'}`}>
                          {data.percentage}%
                        </span>
                      </div>
                      <div className="progress-bar-small">
                        <div
                          className="progress-bar-small__fill"
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>
                      <p className="concept-details">
                        {data.correct}/{data.total} questions correct
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        )}

        {/* All Questions Review */}
        <Card>
          <div className="all-questions-review">
            <div className="review-header">
              <h3>Question Review</h3>
              <button
                onClick={() => setShowAllQuestions(!showAllQuestions)}
                className="toggle-questions-btn"
              >
                {showAllQuestions ? 'Hide All' : 'Show All'} Questions
              </button>
            </div>

            {showAllQuestions && (
              <div className="questions-list">
                {quizData.questions.map((question, index) => {
                  const answer = quizData.answers[question.id]

                  return (
                    <div
                      key={question.id}
                      className={`question-review-item ${answer?.isCorrect ? 'question-review-item--correct' : 'question-review-item--incorrect'}`}
                    >
                      <div className="question-review-header">
                        <span className="question-number">Q{index + 1}</span>
                        <span className={`question-result ${answer?.isCorrect ? 'result--correct' : 'result--incorrect'}`}>
                          {answer?.isCorrect ? '✅' : answer?.skipped ? '⊘ Skipped' : '❌'} {answer?.score || 0}%
                        </span>
                      </div>

                      <p className="question-review-text">{question.question}</p>

                      <div className="question-review-answer">
                        <strong>Your answer:</strong> {answer?.userAnswer || '(No answer)'}
                      </div>

                      {!answer?.isCorrect && (
                        <div className="question-review-correct">
                          <strong>Correct answer:</strong> {
                            answer?.correctAnswer ||
                            answer?.modelAnswer ||
                            (question.type === 'shortAnswer' ? question.modelAnswer : question.correctAnswer)
                          }
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="results__actions">
          {wrongAnswersCount > 0 && (
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={handleReviewMistakes}
            >
              📖 Review {wrongAnswersCount} Wrong Answer{wrongAnswersCount !== 1 ? 's' : ''}
            </Button>
          )}

          <Button
            variant="secondary"
            size="large"
            fullWidth
            onClick={handleRetakeQuiz}
          >
            🔄 Retake Quiz
          </Button>

          <Button
            variant="ghost"
            fullWidth
            onClick={handleBackToDashboard}
          >
            ← Back to Dashboard
          </Button>
        </div>
      </Container>
    </div>
  )
}

export default Results
