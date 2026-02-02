import './Skeleton.css'

function Skeleton({ width = '100%', height = '20px', circle = false, className = '' }) {
  return (
    <div
      className={`skeleton ${circle ? 'skeleton--circle' : ''} ${className}`}
      style={{ width, height }}
    />
  )
}

export default Skeleton
