/**
 * Answer Evaluation Utilities
 * Handles evaluation of different question types
 */

/**
 * Evaluate Multiple Choice Question (Simple exact match)
 */
export function evaluateMCQ(question, userAnswer) {
  let isCorrect = false
  let correctAnswerText = question.correctAnswer

  // Handle case where correctAnswer might be an index (0, 1, 2, 3) or string index ("0", "1", "2", "3")
  const correctAnswerAsNumber = parseInt(question.correctAnswer)

  if (!isNaN(correctAnswerAsNumber) && question.options && question.options[correctAnswerAsNumber]) {
    // correctAnswer is an index, get the actual option text
    correctAnswerText = question.options[correctAnswerAsNumber]
    isCorrect = userAnswer === correctAnswerText
  } else {
    // correctAnswer is already the full text, do direct comparison
    isCorrect = userAnswer === question.correctAnswer

    // Also try comparing just the option letter/prefix (A, B, C, D)
    if (!isCorrect && userAnswer && question.correctAnswer) {
      const userPrefix = userAnswer.trim().charAt(0).toUpperCase()
      const correctPrefix = question.correctAnswer.trim().charAt(0).toUpperCase()
      isCorrect = userPrefix === correctPrefix
    }
  }

  return {
    isCorrect,
    score: isCorrect ? 100 : 0,
    feedback: isCorrect
      ? 'Correct! ' + question.explanation
      : `Incorrect. The correct answer is ${correctAnswerText}. ${question.explanation}`,
    correctAnswer: correctAnswerText,
    userAnswer
  }
}

/**
 * Build prompt for AI to evaluate single-word answer
 */
export function getSingleWordEvaluationPrompt(question, correctAnswer, userAnswer) {
  return `You are evaluating a student's single-word answer.

Question: "${question}"
Expected Answer: "${correctAnswer}"
Student's Answer: "${userAnswer}"

Evaluate if the student's answer is correct. Consider:
1. Exact match
2. Spelling variations (minor typos are acceptable)
3. Singular/plural forms
4. Case differences
5. Synonyms that are scientifically/contextually equivalent

Respond in this EXACT JSON format (no other text):
{
  "isCorrect": true/false,
  "score": 0-100,
  "feedback": "Brief explanation (1 sentence)"
}

Examples of correct evaluation:
- "mitochondria" vs "mitochondrion" → Correct (singular/plural)
- "DNA" vs "dna" → Correct (case difference)
- "nucleus" vs "nuclues" → Correct (minor typo)
- "cell wall" vs "cell membrane" → Incorrect (different structures)

Be fair but accurate.`
}

/**
 * Build prompt for AI to evaluate short answer
 */
export function getShortAnswerEvaluationPrompt(question, modelAnswer, keyPoints, userAnswer) {
  return `You are a teacher grading a student's short answer.

Question: "${question}"

Model Answer (what a perfect answer would include):
"${modelAnswer}"

Key Points that should be covered:
${keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

Student's Answer:
"${userAnswer}"

Grade the student's answer on these criteria:
1. Accuracy: Are the facts correct?
2. Completeness: Are key concepts covered?
3. Understanding: Does the student demonstrate comprehension?
4. Clarity: Is the explanation clear?

Respond in this EXACT JSON format (no other text):
{
  "isCorrect": true/false,
  "score": 0-100,
  "feedback": "2-3 sentence explanation of the grade",
  "strengths": ["what they got right - array of strings"],
  "missing": ["what key points they missed - array of strings"],
  "errors": ["any factual errors - array of strings"]
}

Grading Guidelines:
- 90-100: Excellent, covers all key points accurately
- 80-89: Good, covers most points with minor gaps
- 70-79: Adequate, correct but missing some details (passing)
- 60-69: Partial understanding, significant gaps
- Below 60: Major errors or missing key concepts

Be fair but thorough. Partial credit is okay. Consider "isCorrect" as true if score >= 70.`
}

/**
 * Parse AI evaluation response
 */
export function parseEvaluationResponse(responseText) {
  try {
    let cleaned = responseText.trim()
    cleaned = cleaned.replace(/```json\s*/g, '')
    cleaned = cleaned.replace(/```\s*/g, '')

    const parsed = JSON.parse(cleaned)
    return parsed
  } catch (error) {
    console.error('Error parsing evaluation response:', error)
    throw new Error('Failed to parse AI evaluation response')
  }
}
