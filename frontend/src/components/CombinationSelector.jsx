import { useEffect, useState, useRef } from "react";
import { fetchCombinations } from "../api/client.js";
import { useDecision } from "../state/DecisionContext.jsx";
import "./CombinationSelector.css";

function CombinationSelector() {
  const { state, dispatch } = useDecision();
  const { domain } = state;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (domain && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [domain]);

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

  if (!domain) return null;

  const handleSelect = (combo) => {
    dispatch({ type: "SET_COMBINATION", payload: combo });
  };

  return (
    <section className="combo-section" ref={sectionRef}>
      <div className="combo-section-header">
        <h2 className="combo-heading">
          Select
          Your
          Combination
        </h2>
        <p className="muted">Choose the closest match to your current subjects.</p>
      </div>
      {loading && <p className="muted">Loading combinations…</p>}
      {error && <p className="error-text">{error}</p>}
      <div className="combo-carousel">
        {state.combinations.map((combo) => {
          const isActive = state.selectedCombination?.id === combo.id;
          return (
            <button
              key={combo.id}
              type="button"
              className={`combo-pill ${isActive ? "combo-pill-active" : ""}`}
              onClick={() => handleSelect(combo)}
            >
              <span className="combo-pill-subjects">
                {combo.subjects?.join(" · ")}
              </span>
              {combo.career_cluster?.length > 0 && (
                <span className="combo-pill-clusters">
                  {combo.career_cluster.map((c) => (
                    <span key={c} className="combo-cluster-tag">{c}</span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default CombinationSelector;
