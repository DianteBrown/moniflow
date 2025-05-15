const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-logo">
            <div className="footer-logo-container">
              <img src="/assets/images/moniflow-logo-footer.svg" alt="Moniflow Logo" />
              <span className="footer-logo-text">Moniflow</span>
            </div>
            <p className="footer-desc">
              Take control of your financial future with our all-in-one personal finance management
              platform. Easily track expenses, create budgets, set and reach savings goals, and get insights to make
              smarter financial decisions.
            </p>
            <div className="social-links">
              <a href="#" className="social-link">
                <img src="/assets/images/twitter-icon.svg" alt="Twitter" />
              </a>
              <a href="#" className="social-link">
                <img src="/assets/images/facebook-icon.svg" alt="Facebook" />
              </a>
              <a href="#" className="social-link">
                <img src="/assets/images/youtube-icon.svg" alt="YouTube" />
              </a>
              <a href="#" className="social-link">
                <img src="/assets/images/instagram-icon.svg" alt="Instagram" />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-links-column">
              <h3 className="footer-links-title">Product</h3>
              <a href="#" className="footer-link">Features</a>
              <a href="#" className="footer-link">Pricing</a>
              <a href="#" className="footer-link">Security</a>
              <a href="#" className="footer-link">Roadmap</a>
            </div>

            <div className="footer-links-column">
              <h3 className="footer-links-title">Company</h3>
              <a href="#" className="footer-link">About us</a>
              <a href="#" className="footer-link">Careers</a>
              <a href="#" className="footer-link">Contact us</a>
              <a href="#" className="footer-link">FAQ's</a>
            </div>

            <div className="footer-links-column">
              <h3 className="footer-links-title">Resources</h3>
              <a href="#" className="footer-link">Help center</a>
              <a href="#" className="footer-link">Community</a>
              <a href="#" className="footer-link">Webinars</a>
              <a href="#" className="footer-link">Partners</a>
            </div>

            <div className="footer-links-column">
              <h3 className="footer-links-title">Utilities</h3>
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms</a>
              <a href="#" className="footer-link">Cookies</a>
              <a href="#" className="footer-link">Licenses</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">Copyright © {new Date().getFullYear()} Moniflow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 