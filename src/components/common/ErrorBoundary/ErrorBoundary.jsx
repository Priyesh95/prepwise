import React from 'react'
import Button from '../Button/Button'
import './ErrorBoundary.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <div className="error-boundary__icon">⚠️</div>
            <h1>Something Went Wrong</h1>
            <p className="error-boundary__message">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            <div className="error-boundary__details">
              <p className="error-message">
                {this.state.error?.message || 'Unknown error occurred'}
              </p>
            </div>

            <div className="error-boundary__actions">
              <Button variant="primary" size="large" onClick={this.handleReset}>
                Return to Home
              </Button>

              <button
                onClick={() => window.location.reload()}
                className="reload-link"
              >
                Or try refreshing the page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
