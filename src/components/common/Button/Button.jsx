import './Button.css'

function Button({
  children,
  variant = 'primary',  // 'primary', 'secondary', 'ghost'
  size = 'medium',      // 'small', 'medium', 'large'
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) {
  const buttonClass = `
    btn
    btn--${variant}
    btn--${size}
    ${fullWidth ? 'btn--full-width' : ''}
    ${className}
  `.trim()

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button
