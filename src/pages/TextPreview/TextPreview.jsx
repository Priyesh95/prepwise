import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getMaterial, saveMaterial } from '../../utils/indexedDB'
import Container from '../../components/layout/Container/Container'
import Button from '../../components/common/Button/Button'
import Card from '../../components/common/Card/Card'
import './TextPreview.css'

function TextPreview() {
  const navigate = useNavigate()
  const location = useLocation()
  const materialId = location.state?.materialId

  const [material, setMaterial] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!materialId) {
      navigate('/upload')
      return
    }

    loadMaterial()
  }, [materialId])

  const loadMaterial = async () => {
    try {
      const data = await getMaterial(materialId)
      
      if (!data) {
        setError('Material not found')
        return
      }

      setMaterial(data)
      setEditedText(data.extractedText)
    } catch (err) {
      console.error('Error loading material:', err)
      setError('Failed to load material')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    // For now, just show alert (we'll navigate to question generation in Task 4.3)
    alert('Text verified! Next: Question generation (coming in next task)')
    // navigate('/generate-questions', { state: { materialId } })
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
  }

  const handleTextChange = (e) => {
    setEditedText(e.target.value)
  }

  const handleSaveEdit = async () => {
    try {
      // Update material with edited text
      const updatedMaterial = {
        ...material,
        extractedText: editedText,
        wasEdited: true,
        editedAt: new Date().toISOString()
      }

      await saveMaterial(updatedMaterial)
      setMaterial(updatedMaterial)
      setIsEditing(false)
      alert('Text updated successfully!')
    } catch (err) {
      console.error('Error saving edited text:', err)
      alert('Failed to save changes')
    }
  }

  const handleCancelEdit = () => {
    setEditedText(material.extractedText)
    setIsEditing(false)
  }

  const handleReupload = () => {
    if (window.confirm('Discard this material and upload a new PDF?')) {
      navigate('/upload')
    }
  }

  // Calculate reading stats
  const getReadingStats = () => {
    if (!material) return null

    const words = material.totalWords
    const pages = material.pageCount
    const estimatedReadTime = Math.ceil(words / 200) // 200 words per minute

    return {
      words,
      pages,
      readTime: estimatedReadTime
    }
  }

  if (isLoading) {
    return (
      <div className="text-preview">
        <Container narrow>
          <Card>
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading extracted text...</p>
            </div>
          </Card>
        </Container>
      </div>
    )
  }

  if (error || !material) {
    return (
      <div className="text-preview">
        <Container narrow>
          <Card>
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h2>Error Loading Material</h2>
              <p>{error || 'Material not found'}</p>
              <Button variant="primary" onClick={() => navigate('/upload')}>
                Back to Upload
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    )
  }

  const stats = getReadingStats()

  return (
    <div className="text-preview">
      <Container narrow>
        {/* Header */}
        <div className="text-preview__header">
          <h1>Review Extracted Text</h1>
          <p className="text-preview__subtitle">
            Please verify the text was extracted correctly from your PDF. 
            You can edit if needed before generating questions.
          </p>
        </div>

        {/* Material Info Card */}
        <Card>
          <div className="material-info">
            <div className="material-info__main">
              <h3 className="material-info__title">
                📄 {material.fileName}
              </h3>
              
              <div className="material-info__stats">
                <span className="stat-item">
                  📖 {stats.pages} pages
                </span>
                <span className="stat-item">
                  📝 {stats.words.toLocaleString()} words
                </span>
                <span className="stat-item">
                  ⏱️ ~{stats.readTime} min read
                </span>
              </div>
            </div>

            <div className="material-info__actions">
              <button 
                className="icon-btn"
                onClick={handleEditToggle}
                title={isEditing ? 'Cancel editing' : 'Edit text'}
              >
                {isEditing ? '✕' : '✏️'}
              </button>
            </div>
          </div>
        </Card>

        {/* Text Display/Editor */}
        <Card>
          {!isEditing ? (
            // Read-only view
            <div className="text-display">
              <div className="text-display__content">
                {material.extractedText}
              </div>
            </div>
          ) : (
            // Edit mode
            <div className="text-editor">
              <div className="text-editor__header">
                <h4>Edit Extracted Text</h4>
                <p>Make any necessary corrections to the extracted text.</p>
              </div>
              
              <textarea
                className="text-editor__textarea"
                value={editedText}
                onChange={handleTextChange}
                rows={20}
              />

              <div className="text-editor__actions">
                <Button 
                  variant="primary"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </Button>
                <Button 
                  variant="secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        {!isEditing && (
          <div className="text-preview__actions">
            <Button 
              variant="primary" 
              size="large"
              fullWidth
              onClick={handleContinue}
            >
              ✓ Text Looks Good - Continue
            </Button>
            
            <div className="secondary-actions">
              <Button 
                variant="ghost"
                onClick={handleEditToggle}
              >
                ✏️ Edit Text
              </Button>
              
              <Button 
                variant="ghost"
                onClick={handleReupload}
              >
                ↺ Upload Different PDF
              </Button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="text-preview__help">
          <h4>💡 What to check:</h4>
          <ul>
            <li>Is the text readable and makes sense?</li>
            <li>Are there any garbled characters or symbols?</li>
            <li>Is the content in the correct order?</li>
            <li>Are all important sections included?</li>
          </ul>
          <p className="help-note">
            <strong>Note:</strong> Some formatting (bold, italics, tables) may be lost. 
            This is normal and won't affect question generation.
          </p>
        </div>
      </Container>
    </div>
  )
}

export default TextPreview