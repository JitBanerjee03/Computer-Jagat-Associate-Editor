import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./styles/Header.css";
import { contextProviderDeclare } from "../store/ContextProvider";

const LoggedHeader = () => {
  const [activeLink, setActiveLink] = useState('About');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const getContextProvider = useContext(contextProviderDeclare);
  const { setLoggedIn, isloggedIn } = getContextProvider;

  const handleLogOut = () => {
    localStorage.removeItem('jwtToken'); // Clear current domain token (5178)

    const portals = [
      'https://computer-jagat-author.vercel.app',
      'https://computer-jagat-reviewer.vercel.app',
      'https://computer-jagat-associate-editor.vercel.app',
      'https://computer-jagat-area-editor.vercel.app',
      'https://computer-jagat-chief-editor.vercel.app'
    ];

    // Inject hidden iframes to trigger logout on each portal
    portals.forEach((portal) => {
      const iframe = document.createElement('iframe');
      iframe.src = `${portal}?logout=true&timestamp=${Date.now()}`; // Add timestamp to avoid caching
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    });

    // Allow iframes to execute logout code, then redirect
    setTimeout(() => {
      window.location.href = 'https://computer-jagat.vercel.app/login';
    }, 1500);
  }

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveLink('About');
    else if (path === '/account') setActiveLink('Account');
    else if (path === '/assigned-journals') setActiveLink('Assigned Journals');
    else if (path === '/reviewer-assignment') setActiveLink('Reviewer Assignment');
    else if (path === '/reviewer-status') setActiveLink('Reviewer Status');
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'About', path: '/', icon: '🏠' },
    { label: 'Account', path: '/account', icon: '👤' },
    { label: 'Assigned Journals', path: '/assigned-journals', icon: '📚' },
    { label: 'Reviewer Assignment', path: '/reviewer-assignment', icon: '📋' },
    { label: 'Reviewer Status', path: '/reviewer-status', icon: '✅' },
  ];

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo-container">
          <Link to="/" className="logo-link">
            <img 
              src="/logo.png"
              alt="Journal Management System Logo" 
              className="logo-image"
              width="40"
              height="40"
            />
            <span className="logo-text">Journal Management System</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="main-nav">
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li key={link.label} className="nav-item">
                <Link 
                  to={link.path}
                  className={`nav-link ${activeLink === link.label ? 'active' : ''}`}
                >
                  <span className="nav-icon">{link.icon}</span>
                  {link.label}
                  <span className="active-indicator"></span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button 
          type="button" 
          className="btn btn-outline-warning" 
          style={{ marginLeft: '2%' }}
          onClick={handleLogOut}
        >
          Log Out
        </button>
      </div>
    </header>
  );
};

export default LoggedHeader;