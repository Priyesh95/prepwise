import { useNavigate } from 'react-router-dom'
import { useApiKey } from '../../context/ApiKeyContext/ApiKeyContext'
import Container from '../../components/layout/Container/Container'
import Button from '../../components/common/Button/Button'
import Card from '../../components/common/Card/Card'
import Divider from '../../components/common/Divider/Divider'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const { hasApiKey } = useApiKey()

  const handleGetStarted = () => {
    if (hasApiKey()) {
      navigate('/dashboard')
    } else {
      navigate('/api-setup')
    }
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <Container narrow>
          <div className="hero__content">
            <h1 className="hero__title">PrepWise</h1>
            <p className="hero__tagline">Smart Study, Better Results</p>
            <p className="hero__description">
              Transform your study materials into interactive AI-generated quizzes.
              Upload PDFs, practice with intelligent questions, and master your subjects
              with instant feedback.
            </p>
            <div className="hero__actions">
              <Button
                variant="primary"
                size="large"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
              <Button
                variant="secondary"
                size="large"
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
              >
                How It Works
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features">
        <Container>
          <h2 className="section-title">Why PrepWise?</h2>

          <div className="features__grid">
            <Card>
              <div className="feature">
                <div className="feature__icon">📄</div>
                <h3 className="feature__title">PDF Upload</h3>
                <p className="feature__description">
                  Upload your textbooks, lecture notes, or study guides.
                  We extract the text and analyze the content automatically.
                </p>
              </div>
            </Card>

            <Card>
              <div className="feature">
                <div className="feature__icon">🤖</div>
                <h3 className="feature__title">AI-Generated Questions</h3>
                <p className="feature__description">
                  Claude AI generates tailored questions from your materials.
                  Multiple choice, short answer, and single-word questions.
                </p>
              </div>
            </Card>

            <Card>
              <div className="feature">
                <div className="feature__icon">⚡</div>
                <h3 className="feature__title">Instant Feedback</h3>
                <p className="feature__description">
                  Get immediate, intelligent feedback on every answer.
                  Understand what you got right and where to improve.
                </p>
              </div>
            </Card>

            <Card>
              <div className="feature">
                <div className="feature__icon">📊</div>
                <h3 className="feature__title">Track Progress</h3>
                <p className="feature__description">
                  Monitor your learning journey. Identify weak topics and
                  focus your study time where it matters most.
                </p>
              </div>
            </Card>

            <Card>
              <div className="feature">
                <div className="feature__icon">🎯</div>
                <h3 className="feature__title">Adaptive Learning</h3>
                <p className="feature__description">
                  Review wrong answers, retake quizzes, and practice weak
                  areas until you master every concept.
                </p>
              </div>
            </Card>

            <Card>
              <div className="feature">
                <div className="feature__icon">🔒</div>
                <h3 className="feature__title">Privacy First</h3>
                <p className="feature__description">
                  Everything stays in your browser. No signup required.
                  Your study materials and progress are yours alone.
                </p>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <Divider spacing="large" />

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <Container narrow>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Get started in minutes with our simple 5-step process
          </p>

          <div className="steps">
            <div className="step">
              <div className="step__number">1</div>
              <div className="step__content">
                <h3 className="step__title">Setup API Key</h3>
                <p className="step__description">
                  Get a free Claude API key from Anthropic. Takes 2 minutes,
                  includes $5 free credit (150+ study sessions).
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step__number">2</div>
              <div className="step__content">
                <h3 className="step__title">Upload PDF</h3>
                <p className="step__description">
                  Upload your study material - textbooks, lecture notes, or
                  study guides. We'll extract and analyze the content.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step__number">3</div>
              <div className="step__content">
                <h3 className="step__title">Configure Quiz</h3>
                <p className="step__description">
                  Choose how many questions you want for each type: multiple
                  choice, single word, and short answer.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step__number">4</div>
              <div className="step__content">
                <h3 className="step__title">Take Quiz</h3>
                <p className="step__description">
                  Answer AI-generated questions based on your material. Get
                  instant feedback and detailed explanations.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step__number">5</div>
              <div className="step__content">
                <h3 className="step__title">Review & Improve</h3>
                <p className="step__description">
                  See your results, identify weak areas, and practice until
                  you master every topic. Track progress over time.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Divider spacing="large" />

      {/* CTA Section */}
      <section className="cta">
        <Container narrow>
          <div className="cta__content">
            <h2 className="cta__title">Ready to ace your exams?</h2>
            <p className="cta__description">
              Start studying smarter today with AI-powered quizzes tailored
              to your materials.
            </p>
            <Button
              variant="primary"
              size="large"
              onClick={handleGetStarted}
            >
              Get Started Free
            </Button>
            <p className="cta__note">
              No signup required • Privacy-first • Your data stays local
            </p>
          </div>
        </Container>
      </section>
    </div>
  )
}

export default Home
