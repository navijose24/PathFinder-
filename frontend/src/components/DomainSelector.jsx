import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStreams } from "../api/client.js";
import { useDecision } from "../state/DecisionContext.jsx";
import "./DomainSelector.css";

const domainImages = {
  "Science": "https://sp-ao.shortpixel.ai/client/to_auto,q_glossy,ret_img,w_913,h_477/https://cace.org/wp-content/uploads/2022/02/science-913x477.jpg",
  "Humanities": "https://voegelinview.com/wp-content/uploads/2021/07/Humanities-e1625531525415.jpg",
  "Commerce": "https://img.freepik.com/free-vector/online-shopping-concept_1284-12631.jpg?semt=ais_user_personalization&w=740&q=80",
  "Media & Applied": "https://s3-ap-south-1.amazonaws.com/ricedigitals3bucket/AUPortalContent/2020/07/02030224/mediaimgblog.jpg"
};
const defaultImage = "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80";

function DomainSelector() {
  const { state, dispatch } = useDecision();
  const navigate = useNavigate();
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
    navigate("/journey");
  };

  return (
    <section className="hero-section" id="domain-selector">
      <div className="hero-left">
        <h1 className="hero-heading">
          choose<br />
          your<br />
          stream
        </h1>
        {loading && <p className="muted" style={{ marginTop: '1rem' }}>Loading domains…</p>}
        {error && <p className="error-text" style={{ marginTop: '1rem' }}>{error}</p>}
      </div>

      <div className="hero-right">
        {state.domains.map((domain) => {
          const isActive = state.domain === domain.name;
          const bgImage = domainImages[domain.name] || defaultImage;

          return (
            <div
              key={domain.name}
              className={`accordion-item ${isActive ? "active" : ""}`}
              onClick={() => handleSelect(domain.name)}
              style={{ backgroundImage: `url('${bgImage}')` }}
            >
              <div className="accordion-content">
                <h3>{domain.name}</h3>
                <div className="accordion-stats">
                  <span className="count">{domain.combination_count}</span>
                  <span className="label">SUBJECT COMBINATIONS</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default DomainSelector;


