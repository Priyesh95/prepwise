import { useClaudeAPI } from './useClaudeAPI'
import {
  evaluateMCQ,
  getSingleWordEvaluationPrompt,
  getShortAnswerEvaluationPrompt,
  parseEvaluationResponse
} from '../utils/answerEvaluation'

export function useAnswerEvaluation() {
  const { callClaude } = useClaudeAPI()

  /**
   * Evaluate answer based on question type
   */
  const evaluateAnswer = async (question, userAnswer) => {
    try {
      if (question.type === 'mcq') {
        return evaluateMCQ(question, userAnswer)
      }

      if (question.type === 'singleWord') {
        return await evaluateSingleWord(question, userAnswer)
      }

      if (question.type === 'shortAnswer') {
        return await evaluateShortAnswer(question, userAnswer)
      }

      throw new Error('Unknown question type')
    } catch (error) {
      console.error('Evaluation error:', error)
      throw error
    }
  }

  /**
   * Evaluate single-word answer with AI
   */
  const evaluateSingleWord = async (question, userAnswer) => {
    const prompt = getSingleWordEvaluationPrompt(
      question.question,
      question.correctAnswer,
      userAnswer
    )

    const response = await callClaude(prompt, '', 500)
    const evaluation = parseEvaluationResponse(response)

    return {
      ...evaluation,
      correctAnswer: question.correctAnswer,
      userAnswer,
      acceptedAnswers: question.acceptableAnswers
    }
  }

  /**
   * Evaluate short answer with AI
   */
  const evaluateShortAnswer = async (question, userAnswer) => {
    const prompt = getShortAnswerEvaluationPrompt(
      question.question,
      question.modelAnswer,
      question.keyPoints,
      userAnswer
    )

    const response = await callClaude(prompt, '', 1000)
    const evaluation = parseEvaluationResponse(response)

    return {
      ...evaluation,
      modelAnswer: question.modelAnswer,
      keyPoints: question.keyPoints,
      userAnswer
    }
  }

  return {
    evaluateAnswer
  }
}
