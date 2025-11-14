import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  onSignIn: () => void;
  onGetStarted: () => void;
}

const Header = ({ onSignIn, onGetStarted }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.classList.toggle("menu-open");
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className={`header ${scrolled ? "shadow-md" : ""}`}>
      <div className="header-container">
        <Link to="/" className="logo">
          <img src="/assets/images/logo-1.svg" alt="Heritage Budgeting" className="logo-image" />
          <span>Heritage Budgeting</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <button onClick={() => scrollToSection('features')} className="nav-link">Features</button>
          <button onClick={() => scrollToSection('about')} className="nav-link">About</button>
        </nav>

        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
          </svg>
        </button>

        {/* Desktop buttons */}
        <div className="header-buttons">
          <button
            onClick={onSignIn}
            className="signin"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            <button onClick={() => scrollToSection('features')} className="mobile-nav-link">Features</button>
            <button onClick={() => scrollToSection('about')} className="mobile-nav-link">About</button>
            <button onClick={onGetStarted} className="mobile-nav-link">Get Started</button>
            <button onClick={onSignIn} className="mobile-nav-link">Sign In</button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header; 