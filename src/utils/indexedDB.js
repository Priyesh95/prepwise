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
  await db.put('quizzes', quiz)
  return quiz
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