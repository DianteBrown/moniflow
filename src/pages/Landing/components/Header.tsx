import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  onSignIn: () => void;
  onGetStarted: () => void;
}

const Header = ({ onSignIn }: HeaderProps) => {
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
                
        {/* Desktop buttons */}
        <div className="header-buttons">
          <button 
            onClick={onSignIn} 
            className="signin"
          >
            Login/Sign in
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 