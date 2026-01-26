import Container from '../../components/layout/Container/Container'
import './Quiz.css'

function Quiz() {
  return (
    <Container narrow>
      <div className="quiz">
        <h1>Quiz</h1>
        <p>This page will display questions and handle answer submissions.</p>
      </div>
    </Container>
  )
}

export default Quiz