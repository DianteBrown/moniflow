const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-company-info">
          <p className="footer-copyright">Heritage Budgeting inc</p>
          <p className="footer-copyright">Powered by JAG-TEK LLC</p>
          <p className="footer-copyright">Diantebrown@Jag-Tek.com</p>
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">Copyright © {new Date().getFullYear()} Heritage Budgeting. All rights reserved.</p>
        </div>
      </div>
    </footer >
  );
};

export default Footer; 