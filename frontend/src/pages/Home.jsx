import { useNavigate } from "react-router-dom";
import { useDecision } from "../state/DecisionContext.jsx";
import DomainSelector from "../components/DomainSelector.jsx";

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
    <div className="page home-page">
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

      {/* Section 1: Start Discovery! */}
      <section className="home-section discovery-section">
        <div className="section-header">
          <h2 className="section-title">Start Discovery!</h2>
        </div>
        <DomainSelector />
      </section>

      {/* Section 2: Compare your own course options */}
      <section className="home-section compare-section">
        <div className="section-header">
          <h2 className="section-title">Compare your own course options.</h2>
        </div>

        <div className="compare-grid">
          <div className="compare-card" onClick={goToCareerDuel} data-type="add">
            <div className="compare-card-icon">➕</div>
            <div className="compare-card-content">
              <h3>add options</h3>
              <p>Compare specific careers you have in mind.</p>
            </div>
          </div>

          <div className="compare-card" onClick={goToCareerDuel} data-type="reflect">
            <div className="compare-card-icon">🤔</div>
            <div className="compare-card-content">
              <h3>reflect on questions</h3>
              <p>Answer questions to find your best fit.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;


