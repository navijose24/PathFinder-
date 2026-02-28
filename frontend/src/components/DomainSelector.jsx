import { useEffect, useState } from "react";
import { fetchStreams } from "../api/client.js";
import { useDecision } from "../state/DecisionContext.jsx";

function DomainSelector() {
  const { state, dispatch } = useDecision();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchStreams();
        if (!mounted) return;
        dispatch({ type: "SET_DOMAINS", payload: data.domains });
      } catch (err) {
        if (!mounted) return;
        setError("Unable to load streams. Please try again.");
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (!state.domains.length) {
      load();
    }
    return () => {
      mounted = false;
    };
  }, [dispatch, state.domains.length]);

  const handleSelect = (name) => {
    dispatch({ type: "SET_DOMAIN", payload: name });
  };

  return (
    <section className="card-section">
      <div className="card-section-header">
        <h2>Select your current stream</h2>
        <p className="muted">
          Start by choosing the broad academic domain you are currently pursuing.
        </p>
      </div>
      {loading && <p className="muted">Loading domains…</p>}
      {error && <p className="error-text">{error}</p>}
      <div className="grid grid-2 grid-3-md">
        {state.domains.map((domain) => {
          const isActive = state.domain === domain.name;
          return (
            <button
              key={domain.name}
              type="button"
              className={`card card-clickable domain-card ${
                isActive ? "card-active" : ""
              }`}
              onClick={() => handleSelect(domain.name)}
            >
              <div className="domain-card-icon">
                <span className="icon-circle">
                  {domain.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="domain-card-body">
                <h3>{domain.name}</h3>
                <p className="muted">{domain.description}</p>
                <p className="badge">
                  {domain.combination_count} subject combinations
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default DomainSelector;

