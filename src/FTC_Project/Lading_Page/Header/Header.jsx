import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Header/Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    closeMenu();
  };

  return (
    <header className={`sc-header ${scrolled ? 'sc-scrolled' : ''}`}>
      <div className="sc-header-content">
        {/* Logo */}
        <div className="sc-logo" onClick={() => handleNavigation('/')}>
          <span className="sc-logo-text">Safe</span>
          <span className="sc-logo-highlight">City</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="sc-nav-menu">
        <button 
  className="sc-nav-item" 
  onClick={() => handleNavigation('/')}
  style={{
    fontFamily: "'Old Standard TT', serif",
    fontWeight: 400,
    fontSize: '18px',
    textDecoration: 'none',
    color: 'white',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    position: 'relative',
    padding: '0.5rem 0',
    overflow: 'hidden',
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  }}
>
  <span style={{
    display: 'inline-block',
    transition: 'transform 0.3s ease',
    transform: 'translateY(-1px)'
  }}>Home</span>
  <span style={{
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '2px',
    background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
    transform: 'translateX(0)',
    transition: 'transform 0.3s ease',
    borderRadius: '2px'
  }} />
</button>

          <button className="sc-nav-item" onClick={() => handleNavigation('/report')}>
            <span>Report</span>
          </button>

          <button className="sc-nav-item" onClick={() => handleNavigation('/carte')}>
            <span>Carte</span>
          </button>

          <button className="sc-nav-item" onClick={() => handleNavigation('/notification')}>
            <span>Notification</span>
          </button>
        </nav>

        {/* Desktop Buttons */}
        <div className="sc-auth-buttons">
          <button className="sc-signin-btn" onClick={() => handleNavigation('/signin')}>
            Sign In
          </button>
          <button className="sc-getstarted-btn" onClick={() => handleNavigation('/get-started')}>
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={`sc-mobile-menu-btn ${isMenuOpen ? 'sc-active' : ''}`} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="sc-menu-icon"></span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`sc-mobile-dropdown ${isMenuOpen ? 'sc-open' : ''}`}>
        <div className="sc-mobile-dropdown-content">
          <button className="sc-mobile-nav-item" onClick={() => handleNavigation('/')}>
            <span>Home</span>
          </button>
          <button className="sc-mobile-nav-item" onClick={() => handleNavigation('/report')}>
            <span>Report</span>
          </button>
          <button className="sc-mobile-nav-item" onClick={() => handleNavigation('/carte')}>
            <span>Carte</span>
          </button>
          <button className="sc-mobile-nav-item" onClick={() => handleNavigation('/notification')}>
            <span>Notification</span>
          </button>
          <div className="sc-mobile-auth">
            <button className="sc-mobile-signin" onClick={() => handleNavigation('/signin')}>
              Sign In
            </button>
            <button className="sc-mobile-getstarted" onClick={() => handleNavigation('/get-started')}>
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;