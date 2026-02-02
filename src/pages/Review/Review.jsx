import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMaterial, getQuizzesByMaterial } from '../../utils/indexedDB'
import Container from '../../components/layout/Container/Container'
import Card from '../../components/common/Card/Card'
import Button from '../../components/common/Button/Button'
import './Review.css'

function Review() {
  const navigate = useNavigate()
  const { materialId } = useParams()

  const [material, setMaterial] = useState(null)
  const [wrongQuestions, setWrongQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!materialId) {
      navigate('/dashboard')
      return
    }

    loadReviewData()
  }, [materialId])

  const loadReviewData = async () => {
    try {
      // Load material
      const materialData = await getMaterial(materialId)

      if (!materialData) {
        setError('Material not found')
        return
      }

      setMaterial(materialData)

      // Load quizzes for this material
      const quizzes = await getQuizzesByMaterial(materialId)

      if (quizzes.length === 0) {
        setError('No quiz history found for this material')
        return
      }

      // Get most recent completed quiz
      const completedQuizzes = quizzes
        .filter(q => q.status === 'completed')
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))

      if (completedQuizzes.length === 0) {
        setError('No completed quizzes found')
        return
      }

      const lastQuiz = completedQuizzes[0]

      // Extract wrong answers
      const wrong = lastQuiz.questions.filter(question => {
        const answer = lastQuiz.answers[question.id]
        return answer && !answer.isCorrect && !answer.skipped
      }).map(question => ({
        ...question,
        userAnswer: lastQuiz.answers[question.id].userAnswer,
        feedback: lastQuiz.answers[question.id].feedback,
        score: lastQuiz.answers[question.id].score,
        correctAnswer: lastQuiz.answers[question.id].correctAnswer ||
                      lastQuiz.answers[question.id].modelAnswer ||
                      question.correctAnswer,
        strengths: lastQuiz.answers[question.id].strengths,
        missing: lastQuiz.answers[question.id].missing,
        errors: lastQuiz.answers[question.id].errors
      }))

      if (wrong.length === 0) {
        setError('You got all questions correct! Nothing to review.')
        return
      }

      setWrongQuestions(wrong)
    } catch (err) {
      console.error('Error loading review data:', err)
      setError('Failed to load review data')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePracticeWrongAnswers = () => {
    // Store wrong question IDs for practice session
    localStorage.setItem('practiceQuestions', JSON.stringify({
      materialId,
      questionIds: wrongQuestions.map(q => q.id),
      mode: 'review'
    }))

    // Navigate to configure page (will be handled to use these specific questions)
    navigate(`/configure/${materialId}`, {
      state: {
        mode: 'review',
        questionIds: wrongQuestions.map(q => q.id)
      }
    })
  }

  const getQuestionTypeLabel = (type) => {
    if (type === 'mcq') return '📝 Multiple Choice'
    if (type === 'singleWord') return '💬 Single Word'
    if (type === 'shortAnswer') return '📄 Short Answer'
    return type
  }

  const getScoreColor = (score) => {
    if (score >= 70) return 'score-partial'
    return 'score-wrong'
  }

  if (isLoading) {
    return (
      <div className="review">
        <Container narrow>
          <Card>
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading review...</p>
            </div>
          </Card>
        </Container>
      </div>
    )
  }

  if (error || wrongQuestions.length === 0) {
    return (
      <div className="review">
        <Container narrow>
          <Card>
            <div className="error-state">
              <div className="error-icon">
                {error?.includes('all questions correct') ? '🎉' : '⚠️'}
              </div>
              <h2>{error?.includes('all questions correct') ? 'Perfect Score!' : 'No Review Needed'}</h2>
              <p>{error || 'No wrong answers to review'}</p>
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    )
  }

  return (
    <div className="review">
      <Container narrow>
        {/* Review Header */}
        <div className="review__header">
          <h1>Review Your Mistakes</h1>
          <p className="review__subtitle">
            You got {wrongQuestions.length} question{wrongQuestions.length !== 1 ? 's' : ''} wrong.
            Let's learn from them!
          </p>
        </div>

        {/* Material Info */}
        <Card>
          <div className="review-info">
            <h3>📄 {material.fileName}</h3>
            <p>Reviewing {wrongQuestions.length} incorrect answer{wrongQuestions.length !== 1 ? 's' : ''}</p>
          </div>
        </Card>

        {/* Wrong Questions List */}
        <div className="wrong-questions-list">
          {wrongQuestions.map((question, index) => (
            <Card key={question.id}>
              <div className="wrong-question-item">
                {/* Question Header */}
                <div className="wrong-question-header">
                  <div className="question-meta">
                    <span className="question-number">Question {index + 1}</span>
                    <span className="question-type-badge">
                      {getQuestionTypeLabel(question.type)}
                    </span>
                  </div>
                  <span className={`question-score ${getScoreColor(question.score)}`}>
                    {question.score}%
                  </span>
                </div>

                {/* Question Text */}
                <div className="question-section">
                  <h4 className="section-title-small">Question:</h4>
                  <p className="question-text-review">{question.question}</p>
                </div>

                {/* User's Answer */}
                <div className="answer-section-review">
                  <h4 className="section-title-small">Your Answer:</h4>
                  <div className="answer-box answer-box--user">
                    {question.userAnswer || '(No answer provided)'}
                  </div>
                </div>

                {/* Correct Answer */}
                <div className="answer-section-review">
                  <h4 className="section-title-small">
                    {question.type === 'shortAnswer' ? 'Model Answer:' : 'Correct Answer:'}
                  </h4>
                  <div className="answer-box answer-box--correct">
                    {question.correctAnswer}
                  </div>
                </div>

                {/* Feedback */}
                <div className="feedback-section-review">
                  <h4 className="section-title-small">💡 Explanation:</h4>
                  <p className="feedback-text-review">{question.feedback}</p>
                </div>

                {/* Detailed Feedback for Short Answers */}
                {question.type === 'shortAnswer' && (question.strengths || question.missing || question.errors) && (
                  <div className="detailed-feedback-review">
                    {question.strengths && question.strengths.length > 0 && (
                      <div className="feedback-category-review feedback-category--strengths">
                        <h5>✅ What you got right:</h5>
                        <ul>
                          {question.strengths.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {question.missing && question.missing.length > 0 && (
                      <div className="feedback-category-review feedback-category--missing">
                        <h5>⚠️ What you missed:</h5>
                        <ul>
                          {question.missing.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {question.errors && question.errors.length > 0 && (
                      <div className="feedback-category-review feedback-category--errors">
                        <h5>❌ Errors to correct:</h5>
                        <ul>
                          {question.errors.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* PDF Reference */}
                {question.pdfReference && (
                  <div className="pdf-reference-review">
                    <p>📖 Reference: {question.pdfReference}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="review__actions">
          <Button
            variant="primary"
            size="large"
            fullWidth
            onClick={handlePracticeWrongAnswers}
          >
            🎯 Practice These {wrongQuestions.length} Questions Again
          </Button>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </Button>
        </div>
      </Container>
    </div>
  )
}

export default Review
