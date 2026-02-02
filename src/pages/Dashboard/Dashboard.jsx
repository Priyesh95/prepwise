import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiKey } from '../../context/ApiKeyContext/ApiKeyContext'
import { getAllMaterials, getAllQuizzes, deleteMaterial } from '../../utils/indexedDB'
import Container from '../../components/layout/Container/Container'
import Card from '../../components/common/Card/Card'
import Button from '../../components/common/Button/Button'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const { hasApiKey, isLoading: isLoadingApiKey } = useApiKey()

  const [materials, setMaterials] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // Wait for API key to load from localStorage
    if (isLoadingApiKey) {
      return
    }

    // Redirect if no API key
    if (!hasApiKey()) {
      navigate('/api-setup')
      return
    }

    loadDashboardData()
  }, [isLoadingApiKey, hasApiKey])

  const loadDashboardData = async () => {
    try {
      const [materialsData, quizzesData] = await Promise.all([
        getAllMaterials(),
        getAllQuizzes()
      ])

      setMaterials(materialsData)
      setQuizzes(quizzesData)

      // Calculate stats
      calculateStats(materialsData, quizzesData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (materialsData, quizzesData) => {
    const completedQuizzes = quizzesData.filter(q => q.status === 'completed')

    const totalQuizzes = completedQuizzes.length
    const totalQuestions = completedQuizzes.reduce((sum, q) => sum + (q.totalQuestions || 0), 0)

    let totalScore = 0
    if (completedQuizzes.length > 0) {
      totalScore = completedQuizzes.reduce((sum, q) => sum + (q.results?.totalScore || 0), 0)
      totalScore = Math.round(totalScore / completedQuizzes.length)
    }

    // Calculate study streak (consecutive days)
    const streak = calculateStudyStreak(completedQuizzes)

    setStats({
      totalMaterials: materialsData.length,
      totalQuizzes,
      totalQuestions,
      averageScore: totalScore,
      studyStreak: streak
    })
  }

  const calculateStudyStreak = (quizzesData) => {
    if (quizzesData.length === 0) return 0

    // Get unique dates of completed quizzes
    const dates = quizzesData
      .map(q => new Date(q.completedAt).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b) - new Date(a))

    if (dates.length === 0) return 0

    // Check if studied today
    const today = new Date().toDateString()
    if (dates[0] !== today) return 0

    // Count consecutive days
    let streak = 1
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1])
      const currDate = new Date(dates[i])
      const diffDays = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const getQuizzesForMaterial = (materialId) => {
    return quizzes.filter(q => q.materialId === materialId && q.status === 'completed')
  }

  const getLastQuizScore = (materialId) => {
    const materialQuizzes = getQuizzesForMaterial(materialId)
    if (materialQuizzes.length === 0) return null

    const lastQuiz = materialQuizzes.sort((a, b) =>
      new Date(b.completedAt) - new Date(a.completedAt)
    )[0]

    return lastQuiz.results?.totalScore || 0
  }

  const getWeakConcepts = (materialId) => {
    const materialQuizzes = getQuizzesForMaterial(materialId)
    if (materialQuizzes.length === 0) return []

    // Get latest quiz
    const lastQuiz = materialQuizzes[0]
    const concepts = lastQuiz.results?.conceptScores || {}

    // Find concepts with <70% mastery
    const weak = Object.entries(concepts)
      .filter(([_, data]) => data.percentage < 70)
      .sort((a, b) => a[1].percentage - b[1].percentage)
      .slice(0, 3)
      .map(([concept, _]) => concept)

    return weak
  }

  const handleDeleteMaterial = async (materialId, fileName) => {
    const confirm = window.confirm(
      `Delete "${fileName}" and all associated quizzes? This cannot be undone.`
    )

    if (!confirm) return

    try {
      await deleteMaterial(materialId)

      // Reload dashboard
      loadDashboardData()

      alert('Material deleted successfully')
    } catch (error) {
      console.error('Error deleting material:', error)
      alert('Failed to delete material')
    }
  }

  const handlePractice = (materialId) => {
    // Quick practice with random questions
    navigate(`/configure/${materialId}`, {
      state: { mode: 'practice' }
    })
  }

  const handleFullTest = (materialId) => {
    navigate(`/configure/${materialId}`)
  }

  const handleReview = (materialId) => {
    const wrongAnswers = getWrongAnswersForMaterial(materialId)

    if (wrongAnswers === 0) {
      alert('No wrong answers to review! You aced all questions.')
      return
    }

    navigate(`/review/${materialId}`)
  }

  const getWrongAnswersForMaterial = (materialId) => {
    const materialQuizzes = getQuizzesForMaterial(materialId)
    if (materialQuizzes.length === 0) return 0

    const lastQuiz = materialQuizzes[0]
    return lastQuiz.results?.incorrectCount || 0
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now - date
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="dashboard">
        <Container>
          <Card>
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your dashboard...</p>
            </div>
          </Card>
        </Container>
      </div>
    )
  }

  // Empty state - no materials uploaded
  if (materials.length === 0) {
    return (
      <div className="dashboard">
        <Container narrow>
          <div className="empty-state">
            <div className="empty-state__icon">📚</div>
            <h1>Welcome to PrepWise!</h1>
            <p className="empty-state__description">
              You haven't uploaded any study materials yet.
              Upload a PDF to get started with AI-generated quizzes.
            </p>

            <Button
              variant="primary"
              size="large"
              onClick={() => navigate('/upload')}
            >
              📤 Upload Your First Material
            </Button>

            <div className="empty-state__tips">
              <h3>💡 Getting Started Tips:</h3>
              <ul>
                <li>Upload textbooks, lecture notes, or study guides</li>
                <li>10-50 pages work best for question generation</li>
                <li>Text-based PDFs produce better results than scanned images</li>
                <li>You can upload multiple materials and switch between them</li>
              </ul>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  // Dashboard with materials
  return (
    <div className="dashboard">
      <Container>
        {/* Dashboard Header */}
        <div className="dashboard__header">
          <div className="dashboard__title-section">
            <h1>Dashboard</h1>
            <p className="dashboard__subtitle">
              Welcome back! Track your progress and continue studying.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => navigate('/upload')}
          >
            📤 Upload New Material
          </Button>
        </div>

        {/* Quick Stats */}
        {stats && stats.totalQuizzes > 0 && (
          <Card>
            <div className="quick-stats">
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-content">
                  <span className="stat-value">{stats.totalMaterials}</span>
                  <span className="stat-label">Study Materials</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <span className="stat-value">{stats.totalQuizzes}</span>
                  <span className="stat-label">Quizzes Taken</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <span className="stat-value">{stats.averageScore}%</span>
                  <span className="stat-label">Average Score</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-content">
                  <span className="stat-value">{stats.studyStreak}</span>
                  <span className="stat-label">Day Streak</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Study Materials */}
        <div className="materials-section">
          <h2 className="section-title">Your Study Materials</h2>

          <div className="materials-grid">
            {materials.map(material => {
              const lastScore = getLastQuizScore(material.id)
              const weakConcepts = getWeakConcepts(material.id)
              const quizCount = getQuizzesForMaterial(material.id).length

              return (
                <Card key={material.id}>
                  <div className="material-card">
                    {/* Material Header */}
                    <div className="material-card__header">
                      <div className="material-icon">📄</div>
                      <div className="material-info">
                        <h3 className="material-name">{material.fileName}</h3>
                        <p className="material-meta">
                          {material.pageCount} pages •
                          {material.totalWords.toLocaleString()} words •
                          Uploaded {formatDate(material.uploadedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Material Stats */}
                    {quizCount > 0 && (
                      <div className="material-stats">
                        <div className="material-stat">
                          <span className="material-stat__label">Last Score:</span>
                          <span className={`material-stat__value ${lastScore >= 80 ? 'score-good' : lastScore >= 60 ? 'score-ok' : 'score-weak'}`}>
                            {lastScore}%
                          </span>
                        </div>

                        <div className="material-stat">
                          <span className="material-stat__label">Attempts:</span>
                          <span className="material-stat__value">{quizCount}</span>
                        </div>

                        {material.questionBank && (
                          <div className="material-stat">
                            <span className="material-stat__label">Questions:</span>
                            <span className="material-stat__value">
                              {material.questionBank.totalQuestions} available
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Weak Concepts */}
                    {weakConcepts.length > 0 && (
                      <div className="weak-concepts">
                        <p className="weak-concepts__title">⚠️ Topics needing review:</p>
                        <div className="weak-concepts__list">
                          {weakConcepts.map((concept, i) => (
                            <span key={i} className="concept-tag">
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No quiz history */}
                    {quizCount === 0 && (
                      <div className="no-quiz-message">
                        <p>No quizzes taken yet. Start practicing!</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="material-actions">
                      {material.questionBank ? (
                        <>
                          <Button
                            variant="primary"
                            fullWidth
                            onClick={() => handleFullTest(material.id)}
                          >
                            📝 Full Test
                          </Button>

                          <div className="material-actions__secondary">
                            <Button
                              variant="secondary"
                              onClick={() => handlePractice(material.id)}
                            >
                              ⚡ Quick Practice
                            </Button>

                            {getWrongAnswersForMaterial(material.id) > 0 && (
                              <Button
                                variant="secondary"
                                onClick={() => handleReview(material.id)}
                              >
                                📖 Review ({getWrongAnswersForMaterial(material.id)})
                              </Button>
                            )}
                          </div>
                        </>
                      ) : (
                        <Button
                          variant="primary"
                          fullWidth
                          onClick={() => navigate('/generate-questions', {
                            state: { materialId: material.id }
                          })}
                        >
                          🤖 Generate Questions
                        </Button>
                      )}
                    </div>

                    {/* Material Menu */}
                    <div className="material-menu">
                      <button
                        onClick={() => handleDeleteMaterial(material.id, material.fileName)}
                        className="delete-btn"
                        title="Delete material"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Dashboard
