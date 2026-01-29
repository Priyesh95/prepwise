/**
 * AI Prompts for Question Generation
 * Contains prompt templates for generating different types of quiz questions
 */

/**
 * Generate prompt for Multiple Choice Questions
 * @param {string} textChunk - The text content to generate questions from
 * @param {number} count - Number of questions to generate
 * @returns {string} The formatted prompt
 */
export function generateMCQPrompt(textChunk, count) {
  return `You are an expert educator creating multiple-choice questions for students studying this material.

MATERIAL TO STUDY:
${textChunk}

TASK:
Generate exactly ${count} multiple-choice questions based on the material above.

REQUIREMENTS:
1. Each question must be answerable using ONLY the information provided in the material
2. Questions should test understanding, not just memorization
3. Include a mix of difficulty levels (easy, medium, hard)
4. Cover different topics and concepts from the material
5. Each question must have exactly 4 options (A, B, C, D)
6. Only ONE option should be correct
7. Make incorrect options plausible but clearly wrong to someone who understands the material
8. Avoid "all of the above" or "none of the above" options

OUTPUT FORMAT:
Respond with a JSON array of question objects. Each object must have this exact structure:
{
  "question": "The question text",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correctAnswer": 0,
  "explanation": "Brief explanation of why the correct answer is right"
}

IMPORTANT:
- The correctAnswer field should be the index (0-3) of the correct option in the options array
- Ensure the JSON is valid and parseable
- Do not include any text outside the JSON array
- Generate exactly ${count} questions

JSON OUTPUT:`
}

/**
 * Generate prompt for Single Word Answer Questions
 * @param {string} textChunk - The text content to generate questions from
 * @param {number} count - Number of questions to generate
 * @returns {string} The formatted prompt
 */
export function generateSingleWordPrompt(textChunk, count) {
  return `You are an expert educator creating fill-in-the-blank questions for students studying this material.

MATERIAL TO STUDY:
${textChunk}

TASK:
Generate exactly ${count} single-word answer questions based on the material above.

REQUIREMENTS:
1. Each question must have a ONE-WORD answer that can be found in the material
2. Questions should test recall of key terms, names, concepts, or specific facts
3. The answer should be unambiguous (only one correct word)
4. Questions should be clear about what kind of answer is expected
5. Include a mix of difficulty levels
6. Cover different topics from the material
7. Avoid questions that could have multiple valid one-word answers

EXAMPLES OF GOOD QUESTIONS:
- "What is the process by which plants convert sunlight into energy called?"
- "Who proposed the theory of relativity?"
- "What is the capital city of France?"

OUTPUT FORMAT:
Respond with a JSON array of question objects. Each object must have this exact structure:
{
  "question": "The question text",
  "correctAnswer": "singleword",
  "acceptableAnswers": ["singleword", "alternativespelling"],
  "explanation": "Brief explanation providing context for the answer"
}

IMPORTANT:
- correctAnswer should be the primary/most common form of the answer (lowercase)
- acceptableAnswers should include the main answer plus any common variations or spellings
- All answers should be single words (no spaces, hyphens are okay for compound words)
- Ensure the JSON is valid and parseable
- Do not include any text outside the JSON array
- Generate exactly ${count} questions

JSON OUTPUT:`
}

/**
 * Generate prompt for Short Answer Questions
 * @param {string} textChunk - The text content to generate questions from
 * @param {number} count - Number of questions to generate
 * @returns {string} The formatted prompt
 */
export function generateShortAnswerPrompt(textChunk, count) {
  return `You are an expert educator creating short-answer questions for students studying this material.

MATERIAL TO STUDY:
${textChunk}

TASK:
Generate exactly ${count} short-answer questions based on the material above.

REQUIREMENTS:
1. Each question should require a 2-3 sentence answer
2. Questions should test deeper understanding and ability to explain concepts
3. Questions should ask "why," "how," or "explain" rather than just "what"
4. Answers must be based on information in the provided material
5. Include a mix of difficulty levels
6. Cover different topics from the material
7. Questions should encourage critical thinking and synthesis

EXAMPLES OF GOOD QUESTIONS:
- "Explain how photosynthesis contributes to the carbon cycle."
- "Why is biodiversity important for ecosystem stability?"
- "How does natural selection lead to evolution over time?"

OUTPUT FORMAT:
Respond with a JSON array of question objects. Each object must have this exact structure:
{
  "question": "The question text",
  "modelAnswer": "A complete 2-3 sentence answer that would receive full marks",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "explanation": "Additional context or teaching notes about this concept"
}

IMPORTANT:
- modelAnswer should be a well-written, complete answer (2-3 sentences)
- keyPoints should list 2-4 key concepts that must be included for a complete answer
- Ensure the JSON is valid and parseable
- Do not include any text outside the JSON array
- Generate exactly ${count} questions

JSON OUTPUT:`
}

/**
 * System prompt for question generation
 * This provides context for all question generation requests
 */
export const QUESTION_GENERATION_SYSTEM_PROMPT = `You are an expert educational content creator specializing in creating high-quality study questions. Your questions should:

1. Be clear, unambiguous, and well-worded
2. Test understanding rather than trivial recall
3. Be appropriate for the difficulty level of the material
4. Cover a diverse range of topics from the provided text
5. Be fair - students should be able to answer them if they studied the material
6. Follow academic best practices for assessment design

Always respond with valid JSON in the exact format specified. Never include explanatory text outside the JSON structure.`

/**
 * Helper function to chunk text for processing
 * Splits text into manageable chunks to avoid token limits
 * @param {string} text - The full text to chunk
 * @param {number} maxChunkSize - Maximum characters per chunk
 * @returns {Array<string>} Array of text chunks
 */
export function chunkText(text, maxChunkSize = 8000) {
  // If text is short enough, return as single chunk
  if (text.length <= maxChunkSize) {
    return [text]
  }

  const chunks = []
  const paragraphs = text.split('\n\n')
  let currentChunk = ''

  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed limit
    if (currentChunk.length + paragraph.length > maxChunkSize) {
      // Save current chunk if it has content
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim())
        currentChunk = ''
      }

      // If single paragraph is too large, split it by sentences
      if (paragraph.length > maxChunkSize) {
        const sentences = paragraph.split('. ')
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length > maxChunkSize) {
            if (currentChunk.length > 0) {
              chunks.push(currentChunk.trim())
              currentChunk = ''
            }
          }
          currentChunk += sentence + '. '
        }
      } else {
        currentChunk = paragraph + '\n\n'
      }
    } else {
      currentChunk += paragraph + '\n\n'
    }
  }

  // Add remaining chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

/**
 * Parse AI response and validate JSON
 * @param {string} response - The AI response to parse
 * @returns {Array} Parsed questions array
 * @throws {Error} If response is not valid JSON
 */
export function parseQuestionResponse(response) {
  try {
    // Try to find JSON array in response
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('No JSON array found in response')
    }

    const questions = JSON.parse(jsonMatch[0])

    if (!Array.isArray(questions)) {
      throw new Error('Response is not an array')
    }

    return questions
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    console.error('Response was:', response)
    throw new Error(`Invalid JSON response: ${error.message}`)
  }
}
