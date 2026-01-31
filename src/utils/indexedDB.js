import { openDB } from 'idb'

const DB_NAME = 'prepwise-db'
const DB_VERSION = 1

// Initialize database
export async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create materials store
      if (!db.objectStoreNames.contains('materials')) {
        const materialStore = db.createObjectStore('materials', { 
          keyPath: 'id',
          autoIncrement: false 
        })
        materialStore.createIndex('uploadedAt', 'uploadedAt')
      }

      // Create quizzes store
      if (!db.objectStoreNames.contains('quizzes')) {
        const quizStore = db.createObjectStore('quizzes', { 
          keyPath: 'id',
          autoIncrement: false 
        })
        quizStore.createIndex('materialId', 'materialId')
        quizStore.createIndex('completedAt', 'completedAt')
      }
    }
  })
  return db
}

// Material CRUD operations

export async function saveMaterial(material) {
  const db = await initDB()
  await db.put('materials', material)
  return material
}

export async function getMaterial(id) {
  const db = await initDB()
  return await db.get('materials', id)
}

export async function getAllMaterials() {
  const db = await initDB()
  return await db.getAll('materials')
}

export async function deleteMaterial(id) {
  const db = await initDB()
  await db.delete('materials', id)
}

// Quiz CRUD operations

export async function saveQuiz(quiz) {
  const db = await initDB()

  // Generate id if not provided
  if (!quiz.id) {
    quiz.id = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  // Add timestamp if not provided
  if (!quiz.createdAt) {
    quiz.createdAt = new Date().toISOString()
  }

  await db.put('quizzes', quiz)
  return quiz.id
}

export async function getQuiz(id) {
  const db = await initDB()
  return await db.get('quizzes', id)
}

export async function getQuizzesByMaterial(materialId) {
  const db = await initDB()
  const index = db.transaction('quizzes').store.index('materialId')
  return await index.getAll(materialId)
}

export async function deleteQuiz(id) {
  const db = await initDB()
  await db.delete('quizzes', id)
}

/**
 * Calculate quiz results from quiz data
 */
function calculateQuizResults(quiz) {
  const { questions, answers } = quiz

  let totalScore = 0
  let totalQuestions = questions.length
  let correctCount = 0
  let incorrectCount = 0
  let skippedCount = 0

  // Stats by type
  const byType = {
    mcq: { total: 0, correct: 0, totalScore: 0 },
    singleWord: { total: 0, correct: 0, totalScore: 0 },
    shortAnswer: { total: 0, correct: 0, totalScore: 0 }
  }

  // Concept scores
  const conceptScores = {}

  questions.forEach(question => {
    const answer = answers[question.id]

    if (!answer || answer.skipped) {
      skippedCount++
      return
    }

    const score = answer.score || 0
    totalScore += score

    if (answer.isCorrect) {
      correctCount++
    } else {
      incorrectCount++
    }

    // Update by type
    const typeKey = question.type // Already in camelCase: 'mcq', 'singleWord', 'shortAnswer'
    if (byType[typeKey]) {
      byType[typeKey].total++
      byType[typeKey].totalScore += score
      if (answer.isCorrect) {
        byType[typeKey].correct++
      }
    }

    // Update concept scores
    if (question.concepts) {
      question.concepts.forEach(concept => {
        if (!conceptScores[concept]) {
          conceptScores[concept] = { total: 0, correct: 0, totalScore: 0 }
        }
        conceptScores[concept].total++
        conceptScores[concept].totalScore += score
        if (answer.isCorrect) {
          conceptScores[concept].correct++
        }
      })
    }
  })

  // Calculate averages
  const avgScore = totalQuestions > 0 ? Math.round(totalScore / totalQuestions) : 0

  Object.keys(byType).forEach(type => {
    if (byType[type].total > 0) {
      byType[type].avgScore = Math.round(byType[type].totalScore / byType[type].total)
      byType[type].percentage = Math.round((byType[type].correct / byType[type].total) * 100)
    }
  })

  Object.keys(conceptScores).forEach(concept => {
    const data = conceptScores[concept]
    if (data.total > 0) {
      data.avgScore = Math.round(data.totalScore / data.total)
      data.percentage = Math.round((data.correct / data.total) * 100)
    }
  })

  return {
    totalScore: avgScore,
    totalQuestions,
    correctCount,
    incorrectCount,
    skippedCount,
    byType,
    conceptScores
  }
}

/**
 * Save completed quiz with results to IndexedDB
 */
export async function saveCompletedQuiz(quiz) {
  const db = await initDB()

  // Calculate results
  const results = calculateQuizResults(quiz)

  const completedQuiz = {
    ...quiz,
    results,
    status: 'completed',
    completedAt: new Date().toISOString()
  }

  await db.put('quizzes', completedQuiz)
  return completedQuiz
}