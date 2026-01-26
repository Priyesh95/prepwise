import './Container.css'

function Container({ children, narrow = false, className = '' }) {
  return (
    <div className={`container ${narrow ? 'container--narrow' : ''} ${className}`}>
      {children}
    </div>
  )
}

export default Container