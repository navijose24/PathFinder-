import { useDecision } from "../state/DecisionContext.jsx";
import ResultsDashboard from "../components/ResultsDashboard.jsx";

function Result() {
  const { state } = useDecision();

  return (
    <div className="page">
      <div className="page-header">
        <h2>Your personalised recommendations</h2>
        <p className="muted">
          Review your top courses, compare them across criteria, and read a personalised
          explanation to support your decision.
        </p>
      </div>
      {!state.ranking && (
        <p className="muted">
          You have not generated rankings yet. Go back to the home screen to complete the
          questionnaire and criteria weights.
        </p>
      )}
      <ResultsDashboard />
    </div>
  );
}

export default Result;

