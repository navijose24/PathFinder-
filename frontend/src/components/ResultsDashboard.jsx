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
import { formatCriterionLabel } from "../utils/criteriaLabels.js";

/** Convert raw weights (0–100 per criterion) to normalized (sum = 1) for the API. */
function normalizeWeightsForApi(raw) {
  const entries = Object.entries(raw || {}).map(([k, v]) => [k, Number(v) || 0]);
  const sum = entries.reduce((acc, [, v]) => acc + v, 0);
  if (sum <= 0) {
    const n = entries.length;
    return Object.fromEntries(entries.map(([k]) => [k, n ? 1 / n : 0]));
  }
  return Object.fromEntries(entries.map(([k, v]) => [k, v / sum]));
}

function ResultsDashboard() {
  const { state, dispatch } = useDecision();
  const { selectedCombination, userWeights, weights, ranking, explanation } = state;
  const [loading, setLoading] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [error, setError] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showTieBreak, setShowTieBreak] = useState(false);
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
      criterion: formatCriterionLabel(crit),
      c1: topCourses[0]?.criterion_scores?.[crit] || 0,
      c2: topCourses[1]?.criterion_scores?.[crit] || 0,
      c3: topCourses[2]?.criterion_scores?.[crit] || 0,
    }));
  }, [ranking, userWeights]);

  const jointTopCourses = useMemo(() => {
    if (!ranking?.ranked_courses?.length) return [];
    const [first, ...rest] = ranking.ranked_courses;
    const topScore = first.final_score;
    const EPSILON = 1e-6;
    return [first, ...rest.filter((c) => Math.abs(c.final_score - topScore) < EPSILON)];
  }, [ranking]);

  const bestCourse = useMemo(
    () => (ranking?.ranked_courses?.length ? ranking.ranked_courses[0] : null),
    [ranking],
  );

  const handleGenerate = async () => {
    if (!selectedCombination || !hasWeights) {
      setError("Please complete the questionnaire and weights first.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await rankCourses(
        selectedCombination.id,
        normalizeWeightsForApi(userWeights),
      );
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
        user_weights: normalizeWeightsForApi(userWeights),
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
                <h2 className="chart-title">Final ranking (top courses)</h2>
                <ResponsiveContainer width="100%" height={550}>
                  <BarChart
                    data={rankingData.slice(0, 8)}
                    layout="vertical"
                    margin={{ left: 40, right: 30 }}
                    barCategoryGap="35%"
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
                <h2 className="chart-title">Criteria profile (top 3 courses)</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="criterion" />
                    <PolarRadiusAxis angle={30} domain={[0, 4]} />
                    <Radar
                      name="Top 1"
                      dataKey="c1"
                      stroke="#11924bff"
                      fill="#249c5aff"
                      fillOpacity={0.6}
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
                      stroke="#38322eff"
                      fill="#574d47ff"
                      fillOpacity={0.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="top-course-row">
              <div className="top-course-card">
                {jointTopCourses.length > 1 ? (
                  <>
                    <h3>Joint top courses</h3>
                    <ul className="top-course-list">
                      {jointTopCourses.map((course) => (
                        <li key={course.course} className="top-course-name">
                          {course.course}
                        </li>
                      ))}
                    </ul>
                    <p className="muted small">
                      These {jointTopCourses.length} courses are equally suitable based on
                      your profile.
                    </p>
                    {ranking.tie_breaker_criterion && (
                      <p className="muted small">
                        When you need a single recommendation, we use your highest‑priority
                        criterion (
                        {formatCriterionLabel(ranking.tie_breaker_criterion)})
                        to break the tie.
                      </p>
                    )}
                    <div className="top-course-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowComparison((prev) => !prev)}
                      >
                        {showComparison ? "Hide comparison" : "Compare these courses"}
                      </button>
                      {ranking.tie_breaker_criterion && (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => setShowTieBreak((prev) => !prev)}
                        >
                          {showTieBreak
                            ? "Hide tie‑break suggestion"
                            : "Use my top priority to pick one"}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h3>Top recommended course</h3>
                    <p className="top-course-name">{bestCourse?.course}</p>
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
                  </>
                )}
              </div>

              {showComparison && jointTopCourses.length > 1 && (
                <div className="comparison-card">
                  <h3>Compare joint top courses</h3>
                  <div className="comparison-table-wrapper">
                    <table className="comparison-table">
                      <thead>
                        <tr>
                          <th>Criterion</th>
                          {jointTopCourses.map((course) => (
                            <th key={course.course}>{course.course}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(userWeights || {}).map((crit) => (
                          <tr key={crit}>
                            <td>{formatCriterionLabel(crit)}</td>
                            {jointTopCourses.map((course) => (
                              <td key={`${course.course}-${crit}`}>
                                {Number(
                                  course.criterion_scores?.[crit] ?? 0,
                                ).toFixed(2)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {showTieBreak && bestCourse && (
                <div className="explanation-card">
                  <h3>Suggested course using your top priority</h3>
                  <p className="top-course-name">{bestCourse.course}</p>
                  {ranking.tie_breaker_criterion && (
                    <p className="muted small">
                      This course has the strongest score for your most important
                      criterion:{" "}
                      {formatCriterionLabel(ranking.tie_breaker_criterion)}.
                    </p>
                  )}
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleExplain}
                    disabled={explaining}
                  >
                    {explaining ? "Asking AI…" : "Ask AI for a personalised explanation"}
                  </button>
                </div>
              )}

              {explanation && (
                <article className="explanation-card">
                  <h3>Why this course fits you</h3>
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

