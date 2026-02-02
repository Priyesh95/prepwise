import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useApiKey } from '../../../context/ApiKeyContext/ApiKeyContext'
import Logo from '../../common/Logo/Logo'
import './Header.css'

function Header() {
  const { hasApiKey, isLoading } = useApiKey()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header__content">
          {/* Logo */}
          <NavLink to="/" className="header__logo-link" onClick={closeMobileMenu}>
            <Logo />
          </NavLink>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          {/* Navigation */}
          <nav className={`header__nav ${mobileMenuOpen ? 'header__nav--open' : ''}`}>
            <ul className="nav-list">
              {!isLoading && hasApiKey() && (
                <>
                  <li>
                    <NavLink
                      to="/dashboard"
                      className={({ isActive }) =>
                        isActive ? 'nav-link active' : 'nav-link'
                      }
                      onClick={closeMobileMenu}
                    >
                      Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/upload"
                      className={({ isActive }) =>
                        isActive ? 'nav-link active' : 'nav-link'
                      }
                      onClick={closeMobileMenu}
                    >
                      Upload
                    </NavLink>
                  </li>
                </>
              )}
              <li>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    isActive ? 'nav-link active' : 'nav-link'
                  }
                  onClick={closeMobileMenu}
                >
                  Settings
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
