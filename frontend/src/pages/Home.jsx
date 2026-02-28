import DomainSelector from "../components/DomainSelector.jsx";
import CombinationSelector from "../components/CombinationSelector.jsx";
import Questionnaire from "../components/Questionnaire.jsx";
import CriteriaWeights from "../components/CriteriaWeights.jsx";
import ResultsDashboard from "../components/ResultsDashboard.jsx";
import { useDecision } from "../state/DecisionContext.jsx";

function Home() {
  const { state } = useDecision();

  return (
    <div className="page">
      <div className="page-header">
        <h2>Decision journey</h2>
        <p className="muted">
          Move step by step from your current stream to a transparent, data-backed course
          recommendation. You can always come back and tweak your answers.
        </p>
      </div>

      <div className="stepper">
        <div className={`step ${state.domain ? "step-active" : ""}`}>
          <span className="step-number">1</span>
          <span>Stream</span>
        </div>
        <div
          className={`step ${
            state.selectedCombination ? "step-active" : ""
          }`}
        >
          <span className="step-number">2</span>
          <span>Subjects</span>
        </div>
        <div
          className={`step ${
            Object.keys(state.answers || {}).length ? "step-active" : ""
          }`}
        >
          <span className="step-number">3</span>
          <span>Questions</span>
        </div>
        <div
          className={`step ${
            Object.keys(state.userWeights || {}).length ? "step-active" : ""
          }`}
        >
          <span className="step-number">4</span>
          <span>Weights</span>
        </div>
        <div
          className={`step ${state.ranking ? "step-active" : ""}`}
        >
          <span className="step-number">5</span>
          <span>Results</span>
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

