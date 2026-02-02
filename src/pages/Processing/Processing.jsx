import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { extractTextFromPDF, isProbablyScanned, validateExtractedText } from '../../utils/pdfProcessor'
import { saveMaterial } from '../../utils/indexedDB'
import Container from '../../components/layout/Container/Container'
import Card from '../../components/common/Card/Card'
import './Processing.css'

function Processing() {
  const navigate = useNavigate()
  const location = useLocation()
  const file = location.state?.file

  const [progress, setProgress] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [status, setStatus] = useState('starting') // starting, extracting, analyzing, complete, error
  const [error, setError] = useState('')

  // Prevent double execution in React.StrictMode
  const hasProcessedRef = useRef(false)

  useEffect(() => {
    if (!file) {
      navigate('/upload')
      return
    }

    // Only process once
    if (!hasProcessedRef.current) {
      hasProcessedRef.current = true
      processFile()
    }
  }, [file])

  const processFile = async () => {
    try {
      // Step 1: Starting
      setStatus('starting')
      await sleep(500)

      // Step 2: Extracting text
      setStatus('extracting')
      
      const extractedData = await extractTextFromPDF(file, (current, total) => {
        setCurrentPage(current)
        setTotalPages(total)
        setProgress(Math.round((current / total) * 60)) // 0-60%
      })

      setProgress(70)

      // Step 3: Analyzing
      setStatus('analyzing')
      await sleep(1000)

      // Validate extracted text
      const validation = validateExtractedText(extractedData.text)
      
      if (!validation.isValid) {
        throw new Error(validation.issues.join('. '))
      }

      // Check if scanned
      if (isProbablyScanned(extractedData)) {
        const confirmContinue = window.confirm(
          'This PDF appears to be scanned (image-based). Text extraction may be incomplete. Continue anyway?'
        )
        if (!confirmContinue) {
          navigate('/upload')
          return
        }
      }

      setProgress(90)

      // Step 4: Save to IndexedDB
      setStatus('saving')
      
      const material = {
        id: `material_${Date.now()}`,
        fileName: extractedData.fileName,
        fileSize: extractedData.fileSize,
        extractedText: extractedData.text,
        pageCount: extractedData.pageCount,
        pages: extractedData.pages,
        totalWords: extractedData.totalWords,
        uploadedAt: new Date().toISOString(),
        status: 'extracted',
        questionBank: null // Will be generated in next phase
      }

      await saveMaterial(material)

      setProgress(100)
      setStatus('complete')

      // Navigate to text preview after short delay
      await sleep(1000)
      navigate('/text-preview', { 
        state: { materialId: material.id } 
      })

    } catch (err) {
      console.error('Processing error:', err)
      setStatus('error')
      setError(err.message || 'Failed to process PDF. Please try again.')
    }
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  const handleRetry = () => {
    setProgress(0)
    setCurrentPage(0)
    setTotalPages(0)
    setStatus('starting')
    setError('')
    processFile()
  }

  const handleCancel = () => {
    navigate('/upload')
  }

  return (
    <div className="processing">
      <Container narrow>
        <Card>
          <div className="processing__content">
            {status !== 'error' ? (
              <>
                <div className="processing__icon">
                  {status === 'complete' ? '✅' : '⏳'}
                </div>

                <h1 className="processing__title">
                  {status === 'starting' && 'Preparing...'}
                  {status === 'extracting' && 'Extracting Text from PDF...'}
                  {status === 'analyzing' && 'Analyzing Content...'}
                  {status === 'saving' && 'Saving...'}
                  {status === 'complete' && 'Processing Complete!'}
                </h1>

                <p className="processing__description">
                  {status === 'starting' && 'Loading your PDF file'}
                  {status === 'extracting' && `Processing page ${currentPage} of ${totalPages}`}
                  {status === 'analyzing' && 'Validating extracted text'}
                  {status === 'saving' && 'Saving to local storage'}
                  {status === 'complete' && 'Redirecting to preview...'}
                </p>

                {/* Progress Bar */}
                <div className="progress-bar">
                  <div 
                    className="progress-bar__fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="progress-percentage">{progress}%</p>

                {/* Steps Checklist */}
                <div className="steps-checklist">
                  <div className={`step-item ${progress >= 10 ? 'step-item--complete' : ''}`}>
                    <span className="step-item__icon">
                      {progress >= 10 ? '✅' : '⏸️'}
                    </span>
                    <span className="step-item__text">Loading PDF</span>
                  </div>

                  <div className={`step-item ${progress >= 60 ? 'step-item--complete' : progress > 0 ? 'step-item--active' : ''}`}>
                    <span className="step-item__icon">
                      {progress >= 60 ? '✅' : progress > 0 ? '🔄' : '⏸️'}
                    </span>
                    <span className="step-item__text">Extracting text</span>
                  </div>

                  <div className={`step-item ${progress >= 80 ? 'step-item--complete' : progress >= 60 ? 'step-item--active' : ''}`}>
                    <span className="step-item__icon">
                      {progress >= 80 ? '✅' : progress >= 60 ? '🔄' : '⏸️'}
                    </span>
                    <span className="step-item__text">Analyzing content</span>
                  </div>

                  <div className={`step-item ${progress >= 100 ? 'step-item--complete' : progress >= 80 ? 'step-item--active' : ''}`}>
                    <span className="step-item__icon">
                      {progress >= 100 ? '✅' : progress >= 80 ? '🔄' : '⏸️'}
                    </span>
                    <span className="step-item__text">Saving data</span>
                  </div>
                </div>

                <p className="processing__note">
                  This may take 1-2 minutes. Please don't close this page.
                </p>
              </>
            ) : (
              // Error state
              <>
                <div className="processing__icon error">❌</div>
                
                <h1 className="processing__title">Processing Failed</h1>
                
                <div className="error-message">
                  <p>{error}</p>
                </div>

                <div className="error-actions">
                  <button 
                    className="btn btn--primary btn--large"
                    onClick={handleRetry}
                  >
                    Try Again
                  </button>
                  
                  <button 
                    className="btn btn--secondary btn--large"
                    onClick={handleCancel}
                  >
                    Upload Different File
                  </button>
                </div>

                <div className="error-tips">
                  <h4>Common Issues:</h4>
                  <ul>
                    <li>PDF might be scanned (image-based) - text PDFs work best</li>
                    <li>PDF might be password protected</li>
                    <li>File might be corrupted</li>
                    <li>Try converting to a different PDF format</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </Card>
      </Container>
    </div>
  )
}

export default Processing