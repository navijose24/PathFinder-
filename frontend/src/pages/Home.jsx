import { useNavigate } from "react-router-dom";
import { useDecision } from "../state/DecisionContext.jsx";

function Home() {
  const { state } = useDecision();
  const navigate = useNavigate();

  const goToJourney = () => {
    navigate("/journey");
  };

  const goToCareerDuel = () => {
    navigate("/career-duel");
  };

  return (
    <div className="page">
      <div className="hero-landing">
        <h1 className="hero-main-title">
        What To Choose <span className="text-green">After +2?</span>
        </h1>
        <p className="hero-subtitle">
        Feeling confused about your next step? We've got you covered.
        Find the right stream and career in minutes with PathFinder.
        </p>

        <div className="hero-actions">
          <button
            className="btn btn-primary btn-large"
            onClick={goToJourney}
          >
            Start Discovery Journey <span className="arrow-icon">›</span>
          </button>
          <button
            className="btn btn-ghost btn-large"
            onClick={goToCareerDuel}
          >
            Career Duel (Custom) <span className="bolt-icon">⚡</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;

