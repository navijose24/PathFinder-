import DomainSelector from "../components/DomainSelector.jsx";
import CombinationSelector from "../components/CombinationSelector.jsx";
import Questionnaire from "../components/Questionnaire.jsx";
import CriteriaWeights from "../components/CriteriaWeights.jsx";
import ResultsDashboard from "../components/ResultsDashboard.jsx";
import { useDecision } from "../state/DecisionContext.jsx";

function Home() {
  const { state } = useDecision();

  const scrollToDomains = () => {
    document.getElementById("domain-selector")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="page">
      <div className="hero-landing">
        <h1 className="hero-main-title">Find Your <span className="text-green">True Path</span></h1>
        <p className="hero-subtitle">
          An analytical Decision Companion System designed for Higher
          Secondary students. Discover your career and built for your
          future.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary btn-large" onClick={scrollToDomains}>
            Start Discovery Journey <span className="arrow-icon">›</span>
          </button>
          <button className="btn btn-ghost btn-large">
            Career Duel (Custom) <span className="bolt-icon">⚡</span>
          </button>
        </div>
      </div>

      <DomainSelector />
      <CombinationSelector />
      <Questionnaire />
      <CriteriaWeights />
      <ResultsDashboard />
    </div>
  );
}

export default Home;

