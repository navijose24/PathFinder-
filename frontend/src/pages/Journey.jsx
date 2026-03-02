import DomainSelector from "../components/DomainSelector.jsx";
import CombinationSelector from "../components/CombinationSelector.jsx";
import Questionnaire from "../components/Questionnaire.jsx";
import CriteriaWeights from "../components/CriteriaWeights.jsx";
import ResultsDashboard from "../components/ResultsDashboard.jsx";

function Journey() {
  return (
    <div className="page journey-page">
      <DomainSelector />
      <CombinationSelector />
      <Questionnaire />
      <CriteriaWeights />
      <ResultsDashboard />
    </div>
  );
}

export default Journey;

