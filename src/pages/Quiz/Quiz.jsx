import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuiz } from '../../context/QuizContext/QuizContext'
import { useAnswerEvaluation } from '../../hooks/useAnswerEvaluation'
import Container from '../../components/layout/Container/Container'
import Card from '../../components/common/Card/Card'
import Button from '../../components/common/Button/Button'
import './Quiz.css'

function Quiz() {
  const navigate = useNavigate()
  const {
    activeQuiz,
    currentQuestionIndex,
    timeRemaining,
    submitAnswer,
    saveEvaluation,
    nextQuestion,
    completeQuiz,
    loadQuizFromStorage,
    setTimeRemaining
  } = useQuiz()

  const { evaluateAnswer } = useAnswerEvaluation()

  const [userAnswer, setUserAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [currentEvaluation, setCurrentEvaluation] = useState(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  useEffect(() => {
    // Load quiz from context or localStorage
    if (!activeQuiz) {
      const loaded = loadQuizFromStorage()
      if (!loaded) {
        navigate('/dashboard')
      }
    }
  }, [])

  useEffect(() => {
    // Timer countdown
    if (activeQuiz && activeQuiz.timeLimit && timeRemaining > 0 && !showFeedback) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [activeQuiz, timeRemaining, showFeedback])

  const handleTimeUp = () => {
    alert('Time is up! Quiz will be submitted.')
    handleCompleteQuiz()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmitAnswer = async () => {
    const currentQuestion = activeQuiz.questions[currentQuestionIndex]

    // Validate answer
    if (!userAnswer || userAnswer.trim() === '') {
      alert('Please provide an answer before submitting')
      return
    }

    setIsSubmitting(true)
    setIsEvaluating(true)

    try {
      // Submit answer to context
      submitAnswer(currentQuestion.id, userAnswer)

      // Evaluate answer with AI
      const evaluation = await evaluateAnswer(currentQuestion, userAnswer)

      // Save evaluation
      saveEvaluation(currentQuestion.id, evaluation)

      // Show feedback
      setCurrentEvaluation(evaluation)
      setShowFeedback(true)

    } catch (error) {
      console.error('Error evaluating answer:', error)
      alert('Failed to evaluate answer. Please try again.')
    } finally {
      setIsSubmitting(false)
      setIsEvaluating(false)
    }
  }

  const handleNextQuestion = () => {
    // Check if this was the last question
    if (currentQuestionIndex >= activeQuiz.questions.length - 1) {
      handleCompleteQuiz()
      return
    }

    // Move to next question
    nextQuestion()

    // Reset state for next question
    setUserAnswer('')
    setShowFeedback(false)
    setCurrentEvaluation(null)
  }

  const handleCompleteQuiz = () => {
    const completedQuiz = completeQuiz()

    // Navigate to results
    navigate(`/results/${completedQuiz.id}`)
  }

  const handleSkipQuestion = () => {
    const currentQuestion = activeQuiz.questions[currentQuestionIndex]

    // Submit empty answer
    submitAnswer(currentQuestion.id, '')

    // Mark as skipped with 0 score
    saveEvaluation(currentQuestion.id, {
      isCorrect: false,
      score: 0,
      feedback: 'Question skipped',
      userAnswer: '',
      skipped: true
    })

    // Move to next
    handleNextQuestion()
  }

  if (!activeQuiz) {
    return (
      <div className="quiz">
        <Container narrow>
          <Card>
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading quiz...</p>
            </div>
          </Card>
        </Container>
      </div>
    )
  }

  const currentQuestion = activeQuiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / activeQuiz.totalQuestions) * 100

  return (
    <div className="quiz">
      <Container narrow>
        {/* Quiz Header */}
        <div className="quiz__header">
          <div className="quiz__progress-info">
            <span className="question-counter">
              Question {currentQuestionIndex + 1} of {activeQuiz.totalQuestions}
            </span>

            {activeQuiz.timeLimit && (
              <span className={`timer ${timeRemaining < 300 ? 'timer--warning' : ''} ${timeRemaining < 60 ? 'timer--danger' : ''}`}>
                ⏱️ {formatTime(timeRemaining)}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="progress-bar">
            <div
              className="progress-bar__fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {!showFeedback ? (
          // Question Display
          <Card>
            <div className="question-container">
              {/* Question Type Badge */}
              <div className="question-type-badge">
                {currentQuestion.type === 'mcq' && '📝 Multiple Choice'}
                {currentQuestion.type === 'singleWord' && '💬 Single Word Answer'}
                {currentQuestion.type === 'shortAnswer' && '📄 Short Answer'}
              </div>

              {/* Question Text */}
              <h2 className="question-text">
                {currentQuestion.question}
              </h2>

              {/* Answer Input based on type */}
              {currentQuestion.type === 'mcq' && (
                <div className="mcq-options">
                  {currentQuestion.options.map((option, index) => (
                    <label
                      key={index}
                      className={`mcq-option ${userAnswer === option ? 'mcq-option--selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="mcq-answer"
                        value={option}
                        checked={userAnswer === option}
                        onChange={(e) => setUserAnswer(e.target.value)}
                      />
                      <span className="option-text">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'singleWord' && (
                <div className="answer-input-group">
                  <label htmlFor="answer-input" className="input-label">
                    Your Answer:
                  </label>
                  <input
                    id="answer-input"
                    type="text"
                    className="text-input"
                    placeholder="Type your answer here..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    autoFocus
                  />
                  <p className="input-hint">
                    Enter a single word or short phrase
                  </p>
                </div>
              )}

              {currentQuestion.type === 'shortAnswer' && (
                <div className="answer-input-group">
                  <label htmlFor="answer-textarea" className="input-label">
                    Your Answer (2-4 sentences):
                  </label>
                  <textarea
                    id="answer-textarea"
                    className="textarea-input"
                    placeholder="Type your answer here..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    rows={6}
                    autoFocus
                  />
                  <p className="input-hint">
                    Word count: {userAnswer.split(/\s+/).filter(w => w.length > 0).length}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="question-actions">
                <Button
                  variant="primary"
                  size="large"
                  fullWidth
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                </Button>

                <Button
                  variant="ghost"
                  fullWidth
                  onClick={handleSkipQuestion}
                  disabled={isSubmitting}
                >
                  Skip Question
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          // Feedback Display
          <Card>
            <div className="feedback-container">
              {/* Evaluation Loading */}
              {isEvaluating ? (
                <div className="evaluating-state">
                  <div className="spinner"></div>
                  <p>Evaluating your answer...</p>
                </div>
              ) : (
                <>
                  {/* Score Badge */}
                  <div className={`score-badge ${currentEvaluation.isCorrect ? 'score-badge--correct' : currentEvaluation.score >= 70 ? 'score-badge--partial' : 'score-badge--incorrect'}`}>
                    <span className="score-icon">
                      {currentEvaluation.isCorrect ? '✅' : currentEvaluation.score >= 70 ? '⚠️' : '❌'}
                    </span>
                    <span className="score-text">
                      {currentEvaluation.isCorrect ? 'Correct!' : currentEvaluation.score >= 70 ? 'Partially Correct' : 'Incorrect'}
                    </span>
                    <span className="score-percentage">
                      {currentEvaluation.score}%
                    </span>
                  </div>

                  {/* Your Answer */}
                  <div className="answer-section">
                    <h4>Your Answer:</h4>
                    <div className="answer-display">
                      {currentEvaluation.userAnswer || '(Skipped)'}
                    </div>
                  </div>

                  {/* Correct Answer (if wrong or partial) */}
                  {currentEvaluation.score < 100 && (
                    <div className="answer-section">
                      <h4>
                        {currentQuestion.type === 'shortAnswer' ? 'Model Answer:' : 'Correct Answer:'}
                      </h4>
                      <div className="answer-display answer-display--correct">
                        {currentEvaluation.correctAnswer || currentEvaluation.modelAnswer}
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  <div className="feedback-section">
                    <h4>💡 Feedback:</h4>
                    <p className="feedback-text">
                      {currentEvaluation.feedback}
                    </p>
                  </div>

                  {/* Detailed Feedback for Short Answers */}
                  {currentQuestion.type === 'shortAnswer' && (currentEvaluation.strengths || currentEvaluation.missing || currentEvaluation.errors) && (
                    <div className="detailed-feedback">
                      {currentEvaluation.strengths && currentEvaluation.strengths.length > 0 && (
                        <div className="feedback-category feedback-category--strengths">
                          <h5>✅ What you got right:</h5>
                          <ul>
                            {currentEvaluation.strengths.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {currentEvaluation.missing && currentEvaluation.missing.length > 0 && (
                        <div className="feedback-category feedback-category--missing">
                          <h5>⚠️ What you missed:</h5>
                          <ul>
                            {currentEvaluation.missing.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {currentEvaluation.errors && currentEvaluation.errors.length > 0 && (
                        <div className="feedback-category feedback-category--errors">
                          <h5>❌ Errors to correct:</h5>
                          <ul>
                            {currentEvaluation.errors.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PDF Reference */}
                  {currentQuestion.pdfReference && (
                    <div className="pdf-reference">
                      <p>
                        📖 Reference: {currentQuestion.pdfReference}
                      </p>
                    </div>
                  )}

                  {/* Next Question Button */}
                  <Button
                    variant="primary"
                    size="large"
                    fullWidth
                    onClick={handleNextQuestion}
                  >
                    {currentQuestionIndex >= activeQuiz.questions.length - 1
                      ? 'View Results →'
                      : 'Next Question →'}
                  </Button>
                </>
              )}
            </div>
          </Card>
        )}
      </Container>
    </div>
  )
}

export default Quiz
