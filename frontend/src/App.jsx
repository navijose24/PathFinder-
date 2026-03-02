import { Routes, Route, Navigate, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Result from "./pages/Result.jsx";
import Journey from "./pages/Journey.jsx";
import CareerDuelPage from "./pages/CareerDuelPage.jsx";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="app-logo-area" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="app-logo-road" />
            <h1 style={{ letterSpacing: '0px' }}>PathFinder</h1>
          </Link>

          <nav className="app-nav-links">
            <a href="#" className="nav-link">How it works</a>
          </nav>
        </div>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/career-duel" element={<CareerDuelPage />} />
          <Route path="/results" element={<Result />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="app-logo-area">
              <span className="app-logo-road" />
              <h3>PathFinder</h3>
            </div>
            <p>Empowering students to find their perfect career path after +2.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Platform</h4>
              <Link to="/">Home</Link>
              <Link to="/journey">Discovery</Link>
              <Link to="/career-duel">Career Duel</Link>
            </div>
            <div className="link-group">
              <h4>Support</h4>
              <a href="#">How it works</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} PathFinder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

