import { useEffect, useState } from "react";
import { fetchCombinations } from "../api/client.js";
import { useDecision } from "../state/DecisionContext.jsx";

function CombinationSelector() {
  const { state, dispatch } = useDecision();
  const { domain } = state;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!domain) return;
      try {
        setLoading(true);
        const data = await fetchCombinations(domain);
        if (!mounted) return;
        dispatch({ type: "SET_COMBINATIONS", payload: data.combinations });
      } catch (err) {
        if (!mounted) return;
        setError("Unable to load subject combinations.");
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [domain, dispatch]);

  if (!domain) {
    return null;
  }

  const handleSelect = (combo) => {
    dispatch({ type: "SET_COMBINATION", payload: combo });
  };

  return (
    <section className="card-section">
      <div className="card-section-header">
        <h2>Select your subject combination</h2>
        <p className="muted">
          Choose the closest match to your current subjects. This filters courses
          to those that naturally follow from your background.
        </p>
      </div>
      {loading && <p className="muted">Loading combinations…</p>}
      {error && <p className="error-text">{error}</p>}
      <div className="grid grid-1 grid-2-md">
        {state.combinations.map((combo) => {
          const isActive = state.selectedCombination?.id === combo.id;
          return (
            <button
              key={combo.id}
              type="button"
              className={`card card-clickable combo-card ${
                isActive ? "card-active" : ""
              }`}
              onClick={() => handleSelect(combo)}
            >
              <div className="combo-card-header">
                <span className="badge badge-soft">ID: {combo.id}</span>
                <span className="badge">
                  {combo.career_cluster?.join(" • ")}
                </span>
              </div>
              <p className="combo-subjects">
                {combo.subjects?.join(" · ")}
              </p>
              <p className="muted small">
                Example courses: {combo.courses?.slice(0, 3).join(", ")}
                {combo.courses && combo.courses.length > 3 ? "…" : ""}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default CombinationSelector;

