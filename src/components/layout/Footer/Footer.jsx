import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          {/* Left side - Copyright */}
          <p className="footer__copyright">
            © {currentYear} PrepWise. Built with AI for better learning.
          </p>

          {/* Right side - Links */}
          <div className="footer__links">
            <a href="#about" className="footer__link">About</a>
            <a href="#privacy" className="footer__link">Privacy</a>
            <a href="#contact" className="footer__link">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
