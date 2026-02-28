import { useEffect, useState } from "react";
import { calculateWeights, fetchQuestions } from "../api/client.js";
import { useDecision } from "../state/DecisionContext.jsx";

function Questionnaire() {
  const { state, dispatch } = useDecision();
  const { domain, selectedCombination } = state;
  const [localAnswers, setLocalAnswers] = useState(state.answers);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!domain) return;
      try {
        setLoading(true);
        const data = await fetchQuestions(domain);
        if (!mounted) return;
        dispatch({ type: "SET_QUESTIONS", payload: data.questions });
      } catch (err) {
        if (!mounted) return;
        setError("Unable to load questions.");
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (!state.questions.length && domain) {
      load();
    }
    return () => {
      mounted = false;
    };
  }, [domain, dispatch, state.questions.length]);

  useEffect(() => {
    setLocalAnswers(state.answers);
  }, [state.answers]);

  if (!domain || !selectedCombination) {
    return null;
  }

  const handleSelect = (questionId, value) => {
    const updated = { ...localAnswers, [questionId]: value };
    setLocalAnswers(updated);
    dispatch({ type: "SET_ANSWERS", payload: updated });
  };

  const handleCalculate = async () => {
    if (!Object.keys(localAnswers).length) {
      setError("Please answer at least one question.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const result = await calculateWeights(domain, localAnswers);
      dispatch({ type: "SET_WEIGHTS", payload: result });
    } catch (err) {
      setError("Unable to calculate weights. Please try again.");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card-section">
      <div className="card-section-header">
        <h2>Tell us about your preferences</h2>
        <p className="muted">
          Your answers shape the importance of different decision criteria like income,
          stability, and study duration. All calculations stay fully transparent.
        </p>
      </div>
      {loading && <p className="muted">Loading questions…</p>}
      {error && <p className="error-text">{error}</p>}
      <div className="question-list">
        {state.questions.map((q) => (
          <article key={q.id} className="card question-card">
            <div className="question-header">
              <span className="badge badge-soft">Q{q.id.replace("Q", "")}</span>
              <h3>{q.text}</h3>
              <p className="muted small">Criterion: {q.criterion}</p>
            </div>
            <div className="question-options">
              {q.options.map((opt) => {
                const isActive = Number(localAnswers[q.id]) === Number(opt.value);
                return (
                  <button
                    key={opt.text}
                    type="button"
                    className={`pill-option ${isActive ? "pill-option-active" : ""}`}
                    onClick={() => handleSelect(q.id, opt.value)}
                  >
                    <span className="pill-label">{opt.text}</span>
                    <span className="pill-scale">Scale: {opt.value}</span>
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>
      <div className="question-footer">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleCalculate}
          disabled={saving || !state.questions.length}
        >
          {saving ? "Calculating…" : "Calculate Criteria Weights"}
        </button>
        <p className="muted small">
          We convert your answers into scores for each criterion and normalise them so
          that the total weight equals 100%.
        </p>
      </div>
    </section>
  );
}

export default Questionnaire;

