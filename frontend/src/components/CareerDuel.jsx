import { useMemo, useState } from "react";
import { formatCriterionLabel } from "../utils/criteriaLabels.js";
import "./CareerDuel.css";

const DEFAULT_QUESTIONS = [
  {
    id: "interest",
    criterion: "interest",
    text: "How excited do you feel imagining yourself taking each of these courses day to day?",
  },
  {
    id: "strengths_fit",
    criterion: "strengths_fit",
    text: "How well does each course match your natural strengths and skills right now?",
  },
  {
    id: "growth",
    criterion: "growth",
    text: "Thinking about long‑term growth and opportunities, how strong does each course feel?",
  },
  {
    id: "work_life",
    criterion: "work_life",
    text: "For work–life balance and lifestyle, how comfortable are you with each option?",
  },
  {
    id: "risk",
    criterion: "risk",
    text: "Considering risk and uncertainty, how safe does each course feel for you?",
  },
];

const SCORE_LABELS = [
  { value: 1, label: "Very low" },
  { value: 2, label: "Low" },
  { value: 3, label: "Okay" },
  { value: 4, label: "High" },
  { value: 5, label: "Very high" },
];

function CareerDuel() {
  const [options, setOptions] = useState(["", ""]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touched, setTouched] = useState(false);

  const questionCount = DEFAULT_QUESTIONS.length;
  const currentQuestion = DEFAULT_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / questionCount) * 100;

  const activeOptions = useMemo(
    () => options.map((o) => o.trim()).filter((o) => o.length),
    [options],
  );

  const hasEnoughOptions = activeOptions.length >= 2;

  const handleOptionChange = (index, value) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddOption = () => {
    setOptions((prev) => [...prev, ""]);
  };

  const handleRemoveOption = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleScoreSelect = (optionName, score) => {
    if (!optionName.trim()) return;
    setTouched(true);
    setAnswers((prev) => {
      const qAnswers = prev[currentQuestion.id] || {};
      return {
        ...prev,
        [currentQuestion.id]: {
          ...qAnswers,
          [optionName]: score,
        },
      };
    });
  };

  const canGoNext = useMemo(() => {
    if (!hasEnoughOptions) return false;
    const qAnswers = answers[currentQuestion.id] || {};
    return activeOptions.every((opt) => typeof qAnswers[opt] === "number");
  }, [activeOptions, answers, currentQuestion?.id, hasEnoughOptions]);

  const handleNext = () => {
    if (currentIndex < questionCount - 1 && canGoNext) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const { ranking, totals } = useMemo(() => {
    if (!hasEnoughOptions) return { ranking: [], totals: {} };

    const totalsMap = {};
    const countsMap = {};

    DEFAULT_QUESTIONS.forEach((q) => {
      const qAnswers = answers[q.id] || {};
      activeOptions.forEach((opt) => {
        const score = typeof qAnswers[opt] === "number" ? qAnswers[opt] : null;
        if (score == null) return;
        totalsMap[opt] = (totalsMap[opt] || 0) + score;
        countsMap[opt] = (countsMap[opt] || 0) + 1;
      });
    });

    const rankingArray = activeOptions
      .map((opt) => {
        const total = totalsMap[opt] || 0;
        const count = countsMap[opt] || 0;
        const average = count ? total / count : 0;
        return { option: opt, total, average };
      })
      .sort((a, b) => b.average - a.average);

    return { ranking: rankingArray, totals: totalsMap };
  }, [activeOptions, answers, hasEnoughOptions]);

  const topOption = ranking[0] || null;

  const allAnswered = useMemo(() => {
    if (!hasEnoughOptions) return false;
    return DEFAULT_QUESTIONS.every((q) => {
      const qAnswers = answers[q.id] || {};
      return activeOptions.every((opt) => typeof qAnswers[opt] === "number");
    });
  }, [activeOptions, answers, hasEnoughOptions]);

  return (
    <section className="career-duel-section" id="career-duel">
      <div className="career-duel-header">
        <span className="badge">Special mode · Career Duel</span>
        <h2 className="section-title">Compare your own course options</h2>
        <p className="hero-subtitle">
          Enter the courses you are torn between. We will walk you through a short
          reflection and show which option fits you best right now – with a side‑by‑side
          comparison.
        </p>
      </div>

      <div className="career-duel-grid">
        <div className="career-duel-card">
          <h3 className="card-title">1. Add your course options</h3>
          <p className="muted small">
            Start with at least two options. You can add more if needed.
          </p>
          <div className="option-list">
            {options.map((opt, index) => (
              <div key={index} className="option-row">
                <label className="option-label">
                  Course option {index + 1}
                  <input
                    type="text"
                    placeholder="e.g. Data Science, UX Design…"
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                </label>
                {options.length > 2 && (
                  <button
                    type="button"
                    className="option-remove"
                    onClick={() => handleRemoveOption(index)}
                    aria-label="Remove option"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="link-button"
              onClick={handleAddOption}
            >
              + Add another option
            </button>
            {!hasEnoughOptions && touched && (
              <p className="error-text small">
                Please enter at least two course options to compare.
              </p>
            )}
          </div>
        </div>

        <div className="career-duel-card">
          <h3 className="card-title">2. Reflect on key questions</h3>
          <p className="muted small">
            For each question, rate how well every option fits you. We use a simple
            1–5 scale from very low to very high.
          </p>

          {!hasEnoughOptions && (
            <p className="muted">
              Add at least two options on the left to begin the comparison.
            </p>
          )}

          {hasEnoughOptions && currentQuestion && (
            <div className="duel-question-card">
              <div className="duel-question-header">
                <span className="step-pill">
                  Step {currentIndex + 1} of {questionCount}
                </span>
                <h4>{currentQuestion.text}</h4>
                <p className="criterion-label">
                  Criterion:{" "}
                  {formatCriterionLabel(currentQuestion.criterion) ||
                    currentQuestion.criterion.replace(/_/g, " ")}
                </p>
                <div className="duel-progress">
                  <div
                    className="duel-progress-bar"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="duel-options-grid">
                {activeOptions.map((opt) => {
                  const selected =
                    (answers[currentQuestion.id] || {})[opt] ?? null;
                  return (
                    <div key={opt} className="duel-option-column">
                      <div className="duel-option-title">{opt}</div>
                      <div className="duel-score-buttons">
                        {SCORE_LABELS.map((s) => (
                          <button
                            key={s.value}
                            type="button"
                            className={`score-pill ${selected === s.value ? "score-pill-active" : ""
                              }`}
                            onClick={() => handleScoreSelect(opt, s.value)}
                          >
                            <span className="score-number">{s.value}</span>
                            <span className="score-label">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="duel-nav-footer">
                <button
                  type="button"
                  className="btn-nav"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                >
                  ← Previous
                </button>
                {currentIndex < questionCount - 1 ? (
                  <button
                    type="button"
                    className="btn-nav"
                    onClick={handleNext}
                    disabled={!canGoNext}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!canGoNext}
                    onClick={() => setTouched(true)}
                  >
                    {allAnswered ? "See best‑fit option ↓" : "Finish ratings"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {hasEnoughOptions && topOption && allAnswered && (
        <div className="career-duel-results">
          <div className="career-duel-card ranking-card">
            <h3 className="card-title">3. Our suggestion</h3>
            <p className="muted">
              Based on your ratings, the strongest overall fit right now is:
            </p>
            <div className="winner-badge">
              <span className="winner-label">🏆 Best Fit</span>
              <p className="duel-top-option">{topOption.option}</p>
            </div>
            <p className="muted small" style={{ marginTop: '1.5rem' }}>
              This option has the highest average score across your reflection
              questions.
            </p>
          </div>

          <div className="career-duel-card">
            <h3 className="card-title">Compare options across criteria</h3>
            <div className="comparison-table-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Criterion</th>
                    {ranking.map((r) => (
                      <th key={r.option}>{r.option}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEFAULT_QUESTIONS.map((q) => (
                    <tr key={q.id}>
                      <td>
                        {formatCriterionLabel(q.criterion) ||
                          q.criterion.replace(/_/g, " ")}
                      </td>
                      {ranking.map((r) => {
                        const value =
                          (answers[q.id] || {})[r.option] ?? null;
                        return (
                          <td key={`${q.id}-${r.option}`}>
                            {value != null ? value.toFixed(1) : "–"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="comparison-total-row">
                    <td>Total score</td>
                    {ranking.map((r) => (
                      <td key={`total-${r.option}`}>
                        {totals[r.option]?.toFixed(1) ?? "0.0"}
                      </td>
                    ))}
                  </tr>
                  <tr className="comparison-total-row">
                    <td>Average (out of 5)</td>
                    {ranking.map((r) => (
                      <td key={`avg-${r.option}`}>
                        {r.average.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default CareerDuel;

