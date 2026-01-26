import { NavLink } from 'react-router-dom'
import { useApiKey } from '../../../context/ApiKeyContext/ApiKeyContext'
import Logo from '../../common/Logo/Logo'
import './Header.css'

function Header() {
  const { hasApiKey } = useApiKey()

  return (
    <header className="header">
      <div className="container">
        <div className="header__content">
          {/* Logo */}
          <NavLink to="/" className="header__logo-link">
            <Logo />
          </NavLink>

          {/* Navigation */}
          <nav className="header__nav">
            <ul className="nav-list">
              {hasApiKey() && (
                <>
                  <li>
                    <NavLink
                      to="/dashboard"
                      className={({ isActive }) =>
                        isActive ? 'nav-link active' : 'nav-link'
                      }
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
