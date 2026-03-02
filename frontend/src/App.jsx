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
            <span className="app-logo-dot" style={{ background: '#16a34a' }} />
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
    </div>
  );
}

export default App;

