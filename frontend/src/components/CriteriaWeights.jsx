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
    name: crit.replace("_", " "),
    key: crit,
    value: (userWeights[crit] || 0) * 100,
  }));

  const handleToggleExtra = (criterion) => {
    setExtraVisible((prev) =>
      prev.includes(criterion)
        ? prev.filter((c) => c !== criterion)
        : [...prev, criterion],
    );
  };

  const handleSliderChange = (criterion, value) => {
    const numeric = Number(value);
    const updatedRaw = { ...userWeights, [criterion]: numeric };
    const sum = Object.values(updatedRaw).reduce((acc, v) => acc + Number(v || 0), 0);
    if (sum <= 0) {
      return;
    }
    const normalized = Object.fromEntries(
      Object.entries(updatedRaw).map(([k, v]) => [k, Number(v) / sum]),
    );
    dispatch({ type: "SET_USER_WEIGHTS", payload: normalized });
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
        <div className="chart-row">
          <div className="chart-col">
            <h3 className="chart-title">Weight distribution (%)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" width={140} />
                <Tooltip
                  formatter={(value) => [`${value.toFixed(1)}%`, "Weight"]}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-col">
            <h3 className="chart-title">Adjust weights</h3>
            <div className="slider-list">
              {visibleCriteria.map((crit) => {
                const current = (userWeights[crit] || 0) * 100;
                return (
                  <div key={crit} className="slider-row">
                    <div className="slider-label">
                      <span>{crit.replace("_", " ")}</span>
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
                      {crit.replace("_", " ")}
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

