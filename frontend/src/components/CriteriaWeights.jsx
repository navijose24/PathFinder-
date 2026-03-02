import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useDecision } from "../state/DecisionContext.jsx";
import { formatCriterionLabel } from "../utils/criteriaLabels.js";

function CriteriaWeights() {
  const { state, dispatch } = useDecision();
  const { weights, userWeights } = state;

  const [extraVisible, setExtraVisible] = useState([]);

  const allCriteria = useMemo(
    () => Object.keys(userWeights || {}),
    [userWeights],
  );

  const primary = weights.primary_criteria;
  const secondary = allCriteria.filter((c) => !primary.includes(c));

  const visibleCriteria = [...primary, ...extraVisible].filter((c) =>
    allCriteria.includes(c),
  );

  const chartData = visibleCriteria.map((crit) => ({
    name: formatCriterionLabel(crit),
    key: crit,
    value: Number(userWeights[crit]) || 0,
  }));

  const handleToggleExtra = (criterion) => {
    setExtraVisible((prev) =>
      prev.includes(criterion)
        ? prev.filter((c) => c !== criterion)
        : [...prev, criterion],
    );
  };

  const handleSliderChange = (criterion, value) => {
    const num = Math.max(0, Math.min(100, Number(value)));
    dispatch({
      type: "SET_USER_WEIGHTS",
      payload: { ...userWeights, [criterion]: num },
    });
  };

  if (!Object.keys(userWeights || {}).length) {
    return null;
  }

  return (
    <section className="card-section">
      <div className="card-section-header">
        <h2>Criteria weights</h2>
        <p className="muted">
          These weights show how important each criterion is for you. Adjust them to see
          live changes in course rankings.
        </p>
      </div>

      <div className="card">
        <div className="chart-row" style={{ gap: '2.5rem', alignItems: 'flex-start' }}>
          <div className="chart-col">
            <h3 className="chart-title" style={{ marginBottom: '1.5rem' }}>Weight distribution (%)</h3>
            <ResponsiveContainer width="100%" height={visibleCriteria.length * 60 + 40}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 0, right: 30, top: 0, bottom: 0 }}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 13, fontWeight: 500 }}
                  tickMargin={8}
                />
                <Tooltip
                  formatter={(value) => [`${value.toFixed(1)}%`, "Weight"]}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-col">
            <h3 className="chart-title" style={{ marginBottom: '1.5rem' }}>Adjust weights</h3>
            <div className="slider-list" style={{ gap: '1.25rem' }}>
              {visibleCriteria.map((crit) => {
                const current = Number(userWeights[crit]) || 0;
                return (
                  <div key={crit} className="slider-row">
                    <div className="slider-label">
                      <span>{formatCriterionLabel(crit)}</span>
                      <span className="slider-value">
                        {current.toFixed(1)}
                        %
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={current}
                      onChange={(e) =>
                        handleSliderChange(crit, e.target.value)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {secondary.length > 0 && (
          <div className="extra-criteria">
            <details>
              <summary>Add more criteria</summary>
              <p className="muted small">
                Turn on additional criteria to include them in the weighting and ranking
                calculations.
              </p>
              <div className="pill-row">
                {secondary.map((crit) => {
                  const active = extraVisible.includes(crit);
                  return (
                    <button
                      key={crit}
                      type="button"
                      className={`pill-toggle ${active ? "pill-toggle-active" : ""}`}
                      onClick={() => handleToggleExtra(crit)}
                    >
                      {formatCriterionLabel(crit)}
                    </button>
                  );
                })}
              </div>
            </details>
          </div>
        )}
      </div>
    </section>
  );
}

export default CriteriaWeights;

