import { useEffect, useState, useRef } from "react";
import { calculateWeights, fetchQuestions } from "../api/client.js";
import { useDecision } from "../state/DecisionContext.jsx";
import { formatCriterionLabel } from "../utils/criteriaLabels.js";

function Questionnaire() {
  const { state, dispatch } = useDecision();
  const { domain, selectedCombination } = state;
  const [localAnswers, setLocalAnswers] = useState(state.answers);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef(null);

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

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (domain && selectedCombination && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [domain, selectedCombination]);

  if (!domain || !selectedCombination) {
    return null;
  }

  const animateTo = (index) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsAnimating(false);
    }, 200);
  };

  const handleSelect = (questionId, value) => {
    const updated = { ...localAnswers, [questionId]: value };
    setLocalAnswers(updated);
    dispatch({ type: "SET_ANSWERS", payload: updated });

    // Auto-advance after a brief delay for visual feedback
    if (currentIndex < state.questions.length - 1) {
      setTimeout(() => animateTo(currentIndex + 1), 400);
    }
  };

  const handleCalculate = async () => {
    if (Object.keys(localAnswers).length < state.questions.length) {
      setError("Please answer all questions before calculating.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const result = await calculateWeights(domain, localAnswers);
      dispatch({ type: "SET_WEIGHTS", payload: result });

      // Scroll to results
      const resultsSection = document.getElementById("results-dashboard");
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      setError("Unable to calculate weights. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const totalQuestions = state.questions.length;
  const currentQ = state.questions[currentIndex];
  const isLast = currentIndex === totalQuestions - 1;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <section className="card-section questionnaire-section" ref={sectionRef}>
      <div className="card-section-header">
        <h2>Tell us about your preferences</h2>
        <p className="muted">
          Your answers shape the decision criteria like income,
          stability, and study duration.
        </p>
      </div>

      {loading && <p className="muted">Loading questions…</p>}
      {error && <p className="error-text" style={{ marginBottom: '1rem' }}>{error}</p>}

      {totalQuestions > 0 && currentQ && (
        <div className="question-stack-wrapper">
          {/* Progress bar */}
          <div className="stack-progress-container">
            <div className="stack-progress-bar" style={{ width: `${progress}%` }} />
            <span className="stack-progress-text">Step {currentIndex + 1} of {totalQuestions}</span>
          </div>

          <div className="stack-container">
            {/* Background decorative cards for stack effect */}
            <div className="stack-bg-card stack-bg-1" />
            <div className="stack-bg-card stack-bg-2" />

            {/* Active Question Card */}
            <article className={`card question-card stack-active-card ${isAnimating ? "card-exit" : ""}`}>
              <div className="question-header">
                <span className="q-index-badge">Q{currentIndex + 1}</span>
                <h3>{currentQ.text}</h3>
                <p className="criterion-label">
                  Criterion: {formatCriterionLabel(currentQ.criterion)}
                </p>
              </div>

              <div className="question-options">
                {currentQ.options.map((opt) => {
                  const isActive = Number(localAnswers[currentQ.id]) === Number(opt.value);
                  return (
                    <button
                      key={opt.text}
                      type="button"
                      className={`pill-option stack-option ${isActive ? "pill-option-active" : ""}`}
                      onClick={() => handleSelect(currentQ.id, opt.value)}
                    >
                      <span className="pill-label">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              <div className="stack-nav-footer">
                <button
                  className="btn-nav"
                  onClick={() => animateTo(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0 || isAnimating}
                >
                  ← Previous
                </button>

                {isLast ? (
                  <button
                    type="button"
                    className="btn btn-primary stack-calc-btn"
                    onClick={handleCalculate}
                    disabled={saving || Object.keys(localAnswers).length < totalQuestions || isAnimating}
                  >
                    {saving ? "Calculating…" : "See Results →"}
                  </button>
                ) : (
                  <button
                    className="btn-nav"
                    onClick={() => animateTo(currentIndex + 1)}
                    disabled={isAnimating}
                  >
                    Next →
                  </button>
                )}
              </div>
            </article>
          </div>
        </div>
      )}
    </section>
  );
}

export default Questionnaire;
