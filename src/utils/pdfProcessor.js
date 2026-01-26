import * as pdfjsLib from 'pdfjs-dist'

/// Import worker from node_modules (bundled with Vite)
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// Configure worker with local file
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc


/**
 * Extract text from PDF file
 * @param {File} file - PDF file object
 * @param {Function} onProgress - Progress callback (current, total)
 * @returns {Promise<Object>} - { text, pageCount, pages }
 */
export async function extractTextFromPDF(file, onProgress) {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise

    const pageCount = pdf.numPages
    const pages = []
    let fullText = ''

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      // Report progress
      if (onProgress) {
        onProgress(pageNum, pageCount)
      }

      // Get page
      const page = await pdf.getPage(pageNum)
      
      // Get text content
      const textContent = await page.getTextContent()
      
      // Extract text items and join
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')
        .trim()

      // Store page data
      pages.push({
        pageNumber: pageNum,
        text: pageText,
        wordCount: pageText.split(/\s+/).filter(word => word.length > 0).length
      })

      // Add to full text with page marker
      fullText += `\n\n--- Page ${pageNum} ---\n\n${pageText}`
    }

    // Calculate total word count
    const totalWords = pages.reduce((sum, page) => sum + page.wordCount, 0)

    return {
      text: fullText.trim(),
      pageCount,
      pages,
      totalWords,
      fileName: file.name,
      fileSize: file.size
    }
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error(`Failed to extract text from PDF: ${error.message}`)
  }
}

/**
 * Check if PDF is likely scanned (image-based)
 * @param {Object} extractedData - Result from extractTextFromPDF
 * @returns {boolean}
 */
export function isProbablyScanned(extractedData) {
  const avgWordsPerPage = extractedData.totalWords / extractedData.pageCount
  
  // If average words per page is very low, likely scanned
  return avgWordsPerPage < 50
}

/**
 * Validate extracted text quality
 * @param {string} text - Extracted text
 * @returns {Object} - { isValid, issues }
 */
export function validateExtractedText(text) {
  const issues = []

  if (!text || text.trim().length === 0) {
    issues.push('No text extracted from PDF')
  }

  if (text.length < 100) {
    issues.push('Very little text extracted (less than 100 characters)')
  }

  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
  if (wordCount < 50) {
    issues.push('Too few words extracted - PDF might be scanned or image-based')
  }

  return {
    isValid: issues.length === 0,
    issues,
    wordCount
  }
}