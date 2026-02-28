import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Result from "./pages/Result.jsx";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-title">
          <span className="app-logo-dot" />
          <div>
            <h1>Decision Companion System</h1>
            <p className="app-header-subtitle">
              Transparent, data-driven guidance for +2 students
            </p>
          </div>
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

