import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDecision } from "../state/DecisionContext.jsx";
import { generateExplanation, rankCourses } from "../api/client.js";

function ResultsDashboard() {
  const { state, dispatch } = useDecision();
  const { selectedCombination, userWeights, weights, ranking, explanation } = state;
  const [loading, setLoading] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const hasWeights = Object.keys(userWeights || {}).length > 0;

  const rankingData = useMemo(() => {
    if (!ranking) return [];
    return ranking.ranked_courses.map((c, index) => ({
      name: c.course,
      score: c.final_score,
      rank: index + 1,
    }));
  }, [ranking]);

  const radarData = useMemo(() => {
    if (!ranking || !ranking.top_3?.length) return [];
    const topCourses = ranking.top_3;
    const criteria = Object.keys(userWeights || {});

    return criteria.map((crit) => ({
      criterion: crit.replace("_", " "),
      c1: topCourses[0]?.criterion_scores?.[crit] || 0,
      c2: topCourses[1]?.criterion_scores?.[crit] || 0,
      c3: topCourses[2]?.criterion_scores?.[crit] || 0,
    }));
  }, [ranking, userWeights]);

  const handleGenerate = async () => {
    if (!selectedCombination || !hasWeights) {
      setError("Please complete the questionnaire and weights first.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await rankCourses(selectedCombination.id, userWeights);
      dispatch({ type: "SET_RANKING", payload: result });
      navigate("/results");
    } catch (err) {
      setError("Unable to rank courses. Please try again.");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!ranking?.top_3?.length) return;
    try {
      setExplaining(true);
      setError(null);

      const topCourse = ranking.top_3[0];
      const payload = {
        top_course: topCourse.course,
        top_criteria: weights.sorted_criteria.slice(0, 3),
        user_weights: userWeights,
        subject_combination: selectedCombination?.subjects?.join(", ") || "",
      };
      const result = await generateExplanation(payload);
      dispatch({ type: "SET_EXPLANATION", payload: result });
    } catch (err) {
      setError("Unable to generate explanation right now.");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setExplaining(false);
    }
  };

  if (!selectedCombination) {
    return null;
  }

  return (
    <section className="card-section">
      <div className="card-section-header">
        <h2>Course ranking</h2>
        <p className="muted">
          We apply your criterion weights to each potential course and calculate a final
          score. No black boxes—just transparent weighted sums.
        </p>
      </div>

      <div className="card">
        <div className="results-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading || !hasWeights}
            onClick={handleGenerate}
          >
            {loading ? "Calculating rankings…" : "Generate course rankings"}
          </button>
          {error && <p className="error-text">{error}</p>}
        </div>

        {ranking && (
          <>
            <div className="results-grid">
              <div className="results-panel">
                <h3 className="chart-title">Final ranking (top courses)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={rankingData.slice(0, 8)}
                    layout="vertical"
                    margin={{ left: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={180} />
                    <Tooltip formatter={(value) => [value.toFixed(2), "Score"]} />
                    <Bar dataKey="score" fill="#16a34a" radius={[4, 4, 4, 4]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="results-panel">
                <h3 className="chart-title">Criteria profile (top 3 courses)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="criterion" />
                    <PolarRadiusAxis angle={30} domain={[0, 4]} />
                    <Radar
                      name="Top 1"
                      dataKey="c1"
                      stroke="#2563eb"
                      fill="#2563eb"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Top 2"
                      dataKey="c2"
                      stroke="#16a34a"
                      fill="#16a34a"
                      fillOpacity={0.2}
                    />
                    <Radar
                      name="Top 3"
                      dataKey="c3"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="top-course-row">
              <div className="top-course-card">
                <h3>Top recommended course</h3>
                <p className="top-course-name">{ranking.top_3[0]?.course}</p>
                <p className="muted small">
                  Based on your stream and subject combination:{" "}
                  {selectedCombination.subjects?.join(" · ")}
                </p>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleExplain}
                  disabled={explaining}
                >
                  {explaining ? "Asking AI…" : "Ask AI for a personalised explanation"}
                </button>
              </div>

              {explanation && (
                <article className="explanation-card">
                  <h3>Why this course fits you</h3>
                  <p className="muted small">
                    Generated using your weights and preferences. This text is advisory
                    and meant to support—not replace—human guidance.
                  </p>
                  <div className="explanation-body">
                    {explanation.explanation
                      .split("\n")
                      .filter((p) => p.trim().length)
                      .map((p) => (
                        <p key={p.slice(0, 20)}>{p}</p>
                      ))}
                  </div>
                </article>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default ResultsDashboard;

