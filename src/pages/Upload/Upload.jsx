import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiKey } from '../../context/ApiKeyContext/ApiKeyContext'
import Container from '../../components/layout/Container/Container'
import Button from '../../components/common/Button/Button'
import Card from '../../components/common/Card/Card'
import './Upload.css'

function Upload() {
  const navigate = useNavigate()
  const { hasApiKey } = useApiKey()

  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  // Redirect if no API key
  if (!hasApiKey()) {
    navigate('/api-setup')
    return null
  }

  // File validation
  const validateFile = (file) => {
    setError('')

    // Check if file exists
    if (!file) {
      setError('Please select a file')
      return false
    }

    // Check file type
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported')
      return false
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes
    if (file.size > maxSize) {
      setError('File size must be less than 50MB')
      return false
    }

    return true
  }

  // Handle file selection
  const handleFileSelect = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file)
      setError('')
    }
  }

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Handle upload and process
  const handleUploadAndProcess = () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    // Navigate to processing page with file in state
    navigate('/processing', { 
      state: { file: selectedFile } 
    })
  }

  // Clear selected file
  const handleClearFile = () => {
    setSelectedFile(null)
    setError('')
  }

  return (
    <div className="upload">
      <Container narrow>
        <div className="upload__header">
          <h1>Upload Study Material</h1>
          <p className="upload__subtitle">
            Upload a PDF of your textbook, lecture notes, or study guide.
            We'll extract the text and generate questions for you.
          </p>
        </div>

        <Card>
          {!selectedFile ? (
            // Upload dropzone
            <div
              className={`dropzone ${isDragging ? 'dropzone--active' : ''}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <div className="dropzone__icon">📄</div>
              <p className="dropzone__text">
                Drag and drop your PDF here
              </p>
              <p className="dropzone__or">or</p>
              <Button variant="secondary">
                Browse Files
              </Button>

              <input
                id="file-input"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInputChange}
                className="file-input"
                style={{ display: 'none' }}
              />

              <div className="dropzone__requirements">
                <p>📋 Requirements:</p>
                <ul>
                  <li>PDF files only</li>
                  <li>Maximum size: 50MB</li>
                  <li>Text-based PDFs work best (not scanned images)</li>
                </ul>
              </div>
            </div>
          ) : (
            // File preview
            <div className="file-preview">
              <div className="file-preview__header">
                <h3>Selected File</h3>
                <button
                  onClick={handleClearFile}
                  className="clear-file-btn"
                  aria-label="Clear file"
                >
                  ✕
                </button>
              </div>

              <div className="file-preview__content">
                <div className="file-preview__icon">📄</div>

                <div className="file-preview__details">
                  <p className="file-preview__name">{selectedFile.name}</p>

                  <div className="file-preview__meta">
                    <span className="meta-item">
                      📏 {formatFileSize(selectedFile.size)}
                    </span>
                    <span className="meta-item">
                      📅 {new Date(selectedFile.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="file-preview__info">
                <p>
                  ✅ File is ready for processing. We'll extract the text and
                  generate questions from your study material.
                </p>
              </div>

              <div className="file-preview__actions">
                <Button
                  variant="primary"
                  size="large"
                  fullWidth
                  onClick={handleUploadAndProcess}
                >
                  Upload & Process PDF
                </Button>

                <Button
                  variant="ghost"
                  fullWidth
                  onClick={handleClearFile}
                >
                  Choose Different File
                </Button>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="error-banner">
              <span className="error-banner__icon">⚠️</span>
              <span className="error-banner__text">{error}</span>
            </div>
          )}
        </Card>

        {/* Tips Section */}
        <div className="upload__tips">
          <h3>💡 Tips for Best Results</h3>
          <ul>
            <li>Use text-based PDFs where you can select and copy text</li>
            <li>Scanned PDFs (images of pages) won't work well</li>
            <li>10-50 pages is the ideal range</li>
            <li>Chapter-based content works better than entire textbooks</li>
            <li>Clear, well-formatted PDFs produce better questions</li>
          </ul>
        </div>
      </Container>
    </div>
  )
}

export default Upload
