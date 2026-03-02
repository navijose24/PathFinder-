import { useDecision } from "../state/DecisionContext.jsx";
import ResultsDashboard from "../components/ResultsDashboard.jsx";

function Result() {
  const { state } = useDecision();

  return (
    <div className="page">

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

