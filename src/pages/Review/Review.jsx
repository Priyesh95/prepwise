import Container from '../../components/layout/Container/Container'
import './Review.css'

function Review() {
  return (
    <Container narrow>
      <div className="review">
        <h1>Review Wrong Answers</h1>
        <p>This page will display questions the user got wrong for review.</p>
      </div>
    </Container>
  )
}

export default Review
