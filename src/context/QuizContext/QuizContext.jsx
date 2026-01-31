import { createContext, useContext, useState } from 'react'

const QuizContext = createContext()

export function useQuiz() {
  const context = useContext(QuizContext)
  if (!context) {
    throw new Error('useQuiz must be used within QuizProvider')
  }
  return context
}

export function QuizProvider({ children }) {
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(null)

  // Initialize new quiz
  const initializeQuiz = (config) => {
    const quiz = {
      id: `quiz_${Date.now()}`,
      materialId: config.materialId,
      questions: config.questions, // Selected questions
      totalQuestions: config.questions.length,
      startedAt: new Date().toISOString(),
      timeLimit: config.timeLimit, // in seconds, null if no limit
      status: 'in-progress',
      configuration: {
        mcqCount: config.mcqCount,
        singleWordCount: config.singleWordCount,
        shortAnswerCount: config.shortAnswerCount
      }
    }

    setActiveQuiz(quiz)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setTimeRemaining(config.timeLimit)

    // Save to localStorage for persistence
    localStorage.setItem('activeQuiz', JSON.stringify(quiz))
    
    return quiz
  }

  // Submit answer for current question
  const submitAnswer = (questionId, userAnswer) => {
    const newAnswers = {
      ...answers,
      [questionId]: {
        answer: userAnswer,
        submittedAt: new Date().toISOString(),
        isEvaluated: false
      }
    }

    setAnswers(newAnswers)

    // Save to localStorage
    const updatedQuiz = {
      ...activeQuiz,
      answers: newAnswers
    }
    localStorage.setItem('activeQuiz', JSON.stringify(updatedQuiz))
  }

  // Save evaluation result
  const saveEvaluation = (questionId, evaluation) => {
    const newAnswers = {
      ...answers,
      [questionId]: {
        ...answers[questionId],
        ...evaluation,
        isEvaluated: true
      }
    }

    setAnswers(newAnswers)

    // Save to localStorage
    const updatedQuiz = {
      ...activeQuiz,
      answers: newAnswers
    }
    localStorage.setItem('activeQuiz', JSON.stringify(updatedQuiz))
  }

  // Move to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  // Check if quiz is complete
  const isQuizComplete = () => {
    return currentQuestionIndex >= activeQuiz.questions.length - 1 &&
           answers[activeQuiz.questions[currentQuestionIndex]?.id]?.isEvaluated
  }

  // Complete quiz
  const completeQuiz = () => {
    const completedQuiz = {
      ...activeQuiz,
      answers,
      completedAt: new Date().toISOString(),
      status: 'completed'
    }

    setActiveQuiz(completedQuiz)
    localStorage.setItem('activeQuiz', JSON.stringify(completedQuiz))
    
    return completedQuiz
  }

  // Clear active quiz
  const clearQuiz = () => {
    setActiveQuiz(null)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setTimeRemaining(null)
    localStorage.removeItem('activeQuiz')
  }

  // Load quiz from localStorage
  const loadQuizFromStorage = () => {
    const saved = localStorage.getItem('activeQuiz')
    if (saved) {
      try {
        const quiz = JSON.parse(saved)
        setActiveQuiz(quiz)
        setAnswers(quiz.answers || {})
        setCurrentQuestionIndex(quiz.currentQuestionIndex || 0)
        setTimeRemaining(quiz.timeRemaining)
        return quiz
      } catch (error) {
        console.error('Error loading quiz from storage:', error)
        localStorage.removeItem('activeQuiz')
      }
    }
    return null
  }

  const value = {
    activeQuiz,
    currentQuestionIndex,
    answers,
    timeRemaining,
    initializeQuiz,
    submitAnswer,
    saveEvaluation,
    nextQuestion,
    isQuizComplete,
    completeQuiz,
    clearQuiz,
    loadQuizFromStorage,
    setTimeRemaining
  }

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  )
}

export default QuizContext