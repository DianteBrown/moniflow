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

  return (
    <header className={`header ${scrolled ? "shadow-md" : ""}`}>
      <div className="header-container">
        <Link to="/" className="logo">
          <img src="/assets/images/moniflow-logo.svg" alt="Moniflow Logo" />
          <span>Moniflow</span>
        </Link>
        
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
        
        <nav className={`nav ${isMenuOpen ? "active" : ""}`}>
          <ul className="nav-list">
            <li className="nav-item"><a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a></li>
            <li className="nav-item"><a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a></li>
            <li className="nav-item"><a href="#testimonials" onClick={() => setIsMenuOpen(false)}>Testimonials</a></li>
            <li className="nav-item"><a href="#faq" onClick={() => setIsMenuOpen(false)}>FAQ</a></li>
          </ul>
          
          {/* Mobile buttons */}
          <div className="mobile-header-buttons">
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                onSignIn();
              }} 
              className="signin"
            >
              Sign in
            </button>
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                onGetStarted();
              }} 
              className="btn-primary"
            >
              Get Started Now
            </button>
          </div>
        </nav>
        
        {/* Desktop buttons */}
        <div className="header-buttons">
          <button 
            onClick={onSignIn} 
            className="signin"
          >
            Sign in
          </button>
          <button 
            onClick={onGetStarted} 
            className="btn-primary"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 