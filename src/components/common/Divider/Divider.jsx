import './Divider.css'

function Divider({ spacing = 'medium', className = '' }) {
  return <hr className={`divider divider--${spacing} ${className}`} />
}

export default Divider
