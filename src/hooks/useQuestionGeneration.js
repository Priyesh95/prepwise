import { useState } from 'react'
import { useClaudeAPI } from './useClaudeAPI'
import {
  generateMCQPrompt,
  generateSingleWordPrompt,
  generateShortAnswerPrompt,
  QUESTION_GENERATION_SYSTEM_PROMPT,
  chunkText,
  parseQuestionResponse,
} from '../utils/aiPrompts'

/**
 * Hook for generating quiz questions from text using Claude API
 * @returns {Object} Question generation functions and state
 */
export function useQuestionGeneration() {
  const { callClaude } = useClaudeAPI()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  // Helper to add delay between API calls
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  /**
   * Generate questions from text
   * @param {string} text - The extracted text to generate questions from
   * @param {Object} options - Configuration options
   * @param {Function} options.onProgress - Progress callback (step, total, message)
   * @param {Object} options.counts - Question counts { mcq, singleWord, shortAnswer }
   * @returns {Promise<Object>} Generated questions by type
   */
  const generateQuestions = async (
    text,
    { onProgress, counts = { mcq: 20, singleWord: 15, shortAnswer: 10 } }
  ) => {
    setIsGenerating(true)
    setError(null)

    try {
      // Validate input
      if (!text || text.trim().length === 0) {
        throw new Error('No text provided for question generation')
      }

      // Split text into chunks to avoid token limits
      const chunks = chunkText(text, 8000)
      const totalSteps = 3 // MCQ, Single Word, Short Answer

      // Calculate questions per chunk for each type
      const questionsPerChunk = {
        mcq: Math.ceil(counts.mcq / chunks.length),
        singleWord: Math.ceil(counts.singleWord / chunks.length),
        shortAnswer: Math.ceil(counts.shortAnswer / chunks.length),
      }

      const allQuestions = {
        mcq: [],
        singleWord: [],
        shortAnswer: [],
      }

      // Step 1: Generate Multiple Choice Questions
      if (onProgress) {
        onProgress(1, totalSteps, 'Generating multiple choice questions...')
      }

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const questionsToGenerate = Math.min(
          questionsPerChunk.mcq,
          counts.mcq - allQuestions.mcq.length
        )

        if (questionsToGenerate > 0) {
          try {
            const prompt = generateMCQPrompt(chunk, questionsToGenerate)
            const response = await callClaude(
              prompt,
              QUESTION_GENERATION_SYSTEM_PROMPT,
              4096
            )

            const questions = parseQuestionResponse(response)

            // Validate MCQ structure
            const validQuestions = questions.filter((q) => {
              return (
                q.question &&
                Array.isArray(q.options) &&
                q.options.length === 4 &&
                typeof q.correctAnswer === 'number' &&
                q.correctAnswer >= 0 &&
                q.correctAnswer <= 3 &&
                q.explanation
              )
            })

            // Add question type and unique ID
            validQuestions.forEach((q) => {
              q.type = 'mcq'
              q.id = `mcq_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
            })

            allQuestions.mcq.push(...validQuestions)

            // Add small delay between chunks to avoid rate limiting
            if (i < chunks.length - 1) {
              await delay(1000) // 1 second delay between chunks
            }
          } catch (error) {
            console.error(`Error generating MCQ from chunk ${i}:`, error)
            // Continue with other chunks
          }
        }
      }

      // Trim to exact count
      allQuestions.mcq = allQuestions.mcq.slice(0, counts.mcq)

      // Step 2: Generate Single Word Questions
      if (onProgress) {
        onProgress(2, totalSteps, 'Generating single-word answer questions...')
      }

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const questionsToGenerate = Math.min(
          questionsPerChunk.singleWord,
          counts.singleWord - allQuestions.singleWord.length
        )

        if (questionsToGenerate > 0) {
          try {
            const prompt = generateSingleWordPrompt(chunk, questionsToGenerate)
            const response = await callClaude(
              prompt,
              QUESTION_GENERATION_SYSTEM_PROMPT,
              4096
            )

            const questions = parseQuestionResponse(response)

            // Validate single word structure
            const validQuestions = questions.filter((q) => {
              return (
                q.question &&
                q.correctAnswer &&
                typeof q.correctAnswer === 'string' &&
                Array.isArray(q.acceptableAnswers) &&
                q.explanation
              )
            })

            // Add question type, unique ID, and normalize answers
            validQuestions.forEach((q) => {
              q.type = 'singleWord'
              q.id = `sw_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
              q.correctAnswer = q.correctAnswer.toLowerCase().trim()
              q.acceptableAnswers = q.acceptableAnswers.map((a) =>
                a.toLowerCase().trim()
              )
            })

            allQuestions.singleWord.push(...validQuestions)

            // Add small delay between chunks to avoid rate limiting
            if (i < chunks.length - 1) {
              await delay(1000) // 1 second delay between chunks
            }
          } catch (error) {
            console.error(
              `Error generating single-word questions from chunk ${i}:`,
              error
            )
            // Continue with other chunks
          }
        }
      }

      // Trim to exact count
      allQuestions.singleWord = allQuestions.singleWord.slice(
        0,
        counts.singleWord
      )

      // Step 3: Generate Short Answer Questions
      if (onProgress) {
        onProgress(3, totalSteps, 'Generating short answer questions...')
      }

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const questionsToGenerate = Math.min(
          questionsPerChunk.shortAnswer,
          counts.shortAnswer - allQuestions.shortAnswer.length
        )

        if (questionsToGenerate > 0) {
          try {
            const prompt = generateShortAnswerPrompt(chunk, questionsToGenerate)
            const response = await callClaude(
              prompt,
              QUESTION_GENERATION_SYSTEM_PROMPT,
              4096
            )

            const questions = parseQuestionResponse(response)

            // Validate short answer structure
            const validQuestions = questions.filter((q) => {
              return (
                q.question &&
                q.modelAnswer &&
                Array.isArray(q.keyPoints) &&
                q.keyPoints.length > 0 &&
                q.explanation
              )
            })

            // Add question type and unique ID
            validQuestions.forEach((q) => {
              q.type = 'shortAnswer'
              q.id = `sa_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
            })

            allQuestions.shortAnswer.push(...validQuestions)

            // Add small delay between chunks to avoid rate limiting
            if (i < chunks.length - 1) {
              await delay(1000) // 1 second delay between chunks
            }
          } catch (error) {
            console.error(
              `Error generating short answer questions from chunk ${i}:`,
              error
            )
            // Continue with other chunks
          }
        }
      }

      // Trim to exact count
      allQuestions.shortAnswer = allQuestions.shortAnswer.slice(
        0,
        counts.shortAnswer
      )

      // Validate we have enough questions
      const totalGenerated =
        allQuestions.mcq.length +
        allQuestions.singleWord.length +
        allQuestions.shortAnswer.length

      if (totalGenerated === 0) {
        throw new Error('Failed to generate any questions. Please try again.')
      }

      // Report completion
      if (onProgress) {
        onProgress(
          totalSteps,
          totalSteps,
          `Successfully generated ${totalGenerated} questions!`
        )
      }

      setIsGenerating(false)
      return {
        success: true,
        questions: allQuestions,
        counts: {
          mcq: allQuestions.mcq.length,
          singleWord: allQuestions.singleWord.length,
          shortAnswer: allQuestions.shortAnswer.length,
          total: totalGenerated,
        },
      }
    } catch (error) {
      console.error('Question generation error:', error)
      setError(error.message)
      setIsGenerating(false)

      return {
        success: false,
        error: error.message,
        questions: null,
      }
    }
  }

  /**
   * Regenerate specific question types
   * @param {string} text - The text to generate from
   * @param {string} type - Question type (mcq, singleWord, shortAnswer)
   * @param {number} count - Number of questions to generate
   * @returns {Promise<Array>} Generated questions
   */
  const regenerateQuestionType = async (text, type, count) => {
    setIsGenerating(true)
    setError(null)

    try {
      const chunks = chunkText(text, 8000)
      const questionsPerChunk = Math.ceil(count / chunks.length)
      const questions = []

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const questionsToGenerate = Math.min(
          questionsPerChunk,
          count - questions.length
        )

        if (questionsToGenerate > 0) {
          let prompt
          switch (type) {
            case 'mcq':
              prompt = generateMCQPrompt(chunk, questionsToGenerate)
              break
            case 'singleWord':
              prompt = generateSingleWordPrompt(chunk, questionsToGenerate)
              break
            case 'shortAnswer':
              prompt = generateShortAnswerPrompt(chunk, questionsToGenerate)
              break
            default:
              throw new Error(`Unknown question type: ${type}`)
          }

          const response = await callClaude(
            prompt,
            QUESTION_GENERATION_SYSTEM_PROMPT,
            4096
          )

          const newQuestions = parseQuestionResponse(response)
          newQuestions.forEach((q) => {
            q.type = type
          })

          questions.push(...newQuestions)
        }
      }

      setIsGenerating(false)
      return questions.slice(0, count)
    } catch (error) {
      console.error('Regeneration error:', error)
      setError(error.message)
      setIsGenerating(false)
      throw error
    }
  }

  return {
    generateQuestions,
    regenerateQuestionType,
    isGenerating,
    error,
  }
}
