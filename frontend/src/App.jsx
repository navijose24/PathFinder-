import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Result from "./pages/Result.jsx";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo-area">
            <span className="app-logo-dot" style={{ background: '#16a34a' }} />
            <h1 style={{ letterSpacing: '0px' }}>PathFinder</h1>
          </div>

          <nav className="app-nav-links">
            <a href="#" className="nav-link">How it works</a>
          </nav>
        </div>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Result />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

