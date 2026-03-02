## Build Process – PathFinder Decision Companion
PathFinder is a rule-based, explainable Decision Companion System designed to help +2 students navigate post-secondary course selection through structured criteria weighting and transparent ranking.


This document explains how PathFinder was designed and built from a technical and product point of view. It focuses less on “what the code does” and more on **how the system came to be** – the thinking, changes, and trade‑offs along the way.

---


In the very beginning, my idea for the Decision Companion System (DCS) was rooted in hardware. I imagined building a physical decision-support device—something tangible and intelligent that could guide users through structured comparisons. However, while reflecting on existing market solutions, I realized that major e-commerce platforms like Flipkart and Amazon already provide highly optimized comparison systems for products. Their filtering, rating aggregation, and side-by-side comparison features significantly reduce the real-world need for a separate hardware-based decision system in that space. This realization pushed me to pivot. I then explored the idea of building a general-purpose DCS powered by AI—one that could fetch weighted criteria dynamically and compute decisions based on user preferences. While conceptually powerful, the system quickly became too vast in scope, with heavy dependency on AI for reasoning, weight assignment, and contextual understanding. It began to feel over-engineered and less grounded in a specific, real-world problem. For a while, I was out of direction. Then, during a casual conversation, my brother spoke about his uncertainty regarding his academic future. At that moment, nothing immediately clicked. But later that night, as I was about to sleep, a simple and focused thought emerged: instead of solving every decision problem, why not build a DCS specifically for higher secondary students struggling to choose their next course? That idea became the turning point. The concept evolved from a broad, abstract decision engine into a purpose-driven system—PathFinder—designed to guide students toward informed and confident academic choices.


### From idea to first sketch

PathFinder started with a simple question: *“How can we help a +2 student make a better, more confident decision about what to study next?”* The initial mental model was closer to a **classic comparison tool** – pick a few courses, compare them on some metrics, and highlight the winner.

Very quickly it became clear that this was not enough. Students often do **not** start with a clear list of courses; they start with:

- A stream (Science / Commerce / Humanities / etc.).
- A rough sense of their strengths and constraints.
- A long list of fuzzy concerns: job security, salary, study duration, exams, family expectations.

The first design therefore shifted from “pick a few options and compare” to a **guided journey**:

1. Choose a **stream**.
2. Choose a **subject combination** that matches what the student is actually taking.
3. Answer a **questionnaire** that surfaces preferences and constraints.
4. Translate those answers into **weights for decision criteria**.
5. Use those weights to **rank courses** that are realistically accessible from that combination.

Only after that journey existed did a second mode – **Career Duel** – appear, for students who are already torn between a few specific options and want a lighter, more direct comparison.

---

### Evolving the decision logic

The first internal idea for the decision logic was deliberately simple: **each course would have a few hard‑coded scores** (e.g. stability, salary, years of study), and the user would be able to assign weights to those criteria using sliders. A weighted sum would yield the final score. This model was attractive because it is:

- Easy to explain.
- Easy to tune by domain experts.
- Deterministic and debuggable.

However, there were two gaps:

1. **How to derive initial weights**: Asking users to manually set 8–10 sliders without context is overwhelming.
2. **How to ensure we cover the right criteria**: Different streams emphasise different things (e.g. competitive exams vs. research interest).

To handle this, the thinking evolved into:

- Put more effort into a **rich questionnaire**, where each question is tied to a specific criterion.
- Build a **weight engine** on the backend that interprets answers into raw scores per criterion and then normalises them.
- Use those normalised weights to initialise the frontend sliders, which the user can further tweak.

This split gave a nice balance: the backend encapsulates domain logic and scoring; the frontend gives the user agency and visibility over the final weights.

---

### Alternative approaches considered

Several alternative designs were explored and intentionally rejected:

- **Pure AI ranking (“Ask the model what to recommend”)**
  - This would mean sending the student’s answers, course list, and some prompts to a large language model and letting it decide the best option.
  - It was discarded because:
    - It is **not explainable** in a precise way.
    - Behaviour can drift as models change.
    - It violates the requirement that the system **must not rely entirely on AI**.

- **Complex statistical / ML model**
  - A light ML model (e.g. gradient boosted trees) trained on historical counselling data was considered conceptually.
  - It was set aside because there is **no real historical dataset** yet, and adding a model at this stage would introduce complexity without genuine predictive power.

- **Fully static decision tree**
  - A rule‑based decision tree (e.g. “If you said 5/5 for income and 1/5 for study years, recommend X, else Y”) was also an early idea.
  - It was rejected because it would explode combinatorially with more criteria, and would be hard to maintain or extend without breaking existing paths.

The final approach – a **configurable course–criteria matrix + weighted sum + questionnaire‑driven weights** – was chosen because it is both **transparent** and **practical** for an evolving product.


By the end of these iterations, the system converged on a relatively clean and modular shape:

- **Frontend**
  - React SPA with React Router for navigation.
  - A central `DecisionContext` + reducer to coordinate the multi‑step decision journey.
  - Presentation components for each step (Domain selector, Combination selector, Questionnaire, Criteria weights, Results dashboard, Career Duel).

- **Backend**
  - Django + Django REST Framework for a small, focused API surface.
  - Endpoints for streams, combinations, questions, weight calculation, course ranking, and optional explanation.

- **Core decision engine**
  - A **Weight Engine** that turns questionnaire answers into normalised criterion weights.
  - A **Ranking Engine** that applies those weights to a **Course–Criteria Matrix** of heuristic scores for each course.
  - A simple, transparent scoring formula (weighted sum) exposed through the API.

- **Optional layer**
  - An **AI Explanation Service** that uses Gemini (when configured) to turn structured ranking data into a natural‑language explanation, with a deterministic fallback when AI is unavailable.

This snapshot is the “contract” the rest of the document refers back to: a small, explainable core surrounded by a guided UI and an optional AI narrative layer.

---

### Refactoring the architecture

The code structure did not arrive fully formed. Early versions of the frontend used **local component state** for almost everything. This became fragile as soon as the flow stretched across multiple screens (stream, combinations, questions, weights, results). It was too easy to lose data when navigating or rerendering.

This led to a deliberate refactor:

- Introduce a central `DecisionContext` with a reducer to hold:
  - Domain and combinations.
  - Questions and answers.
  - Weights (backend‑derived and user‑adjusted).
  - Rankings and explanations.
- Move side‑effects (e.g. fetching streams, combinations, questions) into step‑specific components that **write** into the shared context.

On the backend, a similar refactoring happened:

- Initial logic for ranking and weight calculation was intertwined in view functions.
- This was split into dedicated services (`weight_engine`, `ranking_engine`, `gemini_service`) so that:
  - Views are thin HTTP wrappers.
  - The core decision logic can be tested and iterated independently.

These refactors made the codebase more predictable: when something looks wrong in a ranking, there is a clear place to debug (the ranking engine and the course matrix).

---

### Mistakes, corrections, and learning

There were several points where the implementation took a wrong turn and had to be corrected:

- **Treating all sliders as independent without normalisation**
  - Early on, the frontend stored slider values directly and passed them to the backend without normalisation.
  - This meant a user who set all sliders to 100 had a very different influence profile from one who used smaller numbers, even if the **relative preferences** were the same.
  - The fix was to introduce a clear **normalisation step**: the frontend constrains sliders to 0–100, and a helper converts them into weights that sum to 1 before ranking.

- **Overloading the questionnaire screen**
  - The first questionnaire design showed **too many questions at once**, making the experience feel heavy.
  - It was refactored into a **card stack** with one question at a time, progress indication, and auto‑advance behaviour after each answer. This made the flow feel more like a guided conversation.

- **Assuming AI would always be available**
  - The initial plan for AI explanations did not fully consider missing or misconfigured API keys.
  - This was corrected by adding a deterministic fallback explanation and making the AI integration a thin, optional layer that never blocks the rest of the system.

Each of these corrections reinforced the guiding principle: **predictability and clarity over cleverness**.

---

### What changed over time and why

Several important shifts happened during development:

- **From a single mode to two distinct modes**
  - The original vision only had the guided journey.
  - When my thoughts get deeper, I realize that many students already have a couple of concrete options in mind and just want a structured way to compare them.
  - This led to the creation of **Career Duel**, a much lighter tool that reuses the same idea of criteria and scores but gives the user full control over the options.

- **From manually set weights to questionnaire‑driven weights with manual fine‑tuning**
  - Initially, users were expected to “just know” how much they value stability vs. salary vs. years of study.
  - This proved unrealistic; the questionnaire allows those preferences to emerge more organically.
  - The UI now uses the backend‑derived weights as a starting point, while still letting users adjust them if they disagree.

- **From opaque backend magic to explicit services and configuration**
  - Early ranking logic was hidden in a few dense functions.
  - Over time it was pulled into a clear pipeline: **course matrix → weights → weighted sums → rankings → optional AI explanation**.
  - Supporting scripts (like the matrix generator) and configuration files became first‑class citizens instead of “one‑off utilities”.

---

### What the current limitations actually mean

The following limitations reflect intentional scope boundaries rather than technical gaps:

- **Heuristic matrix instead of empirically validated scoring**
  - The Course–Criteria Matrix is logically structured.
  - However, it is not yet calibrated using large-scale counselling or placement datasets.
  - This keeps the system explainable, but limits statistical validation.

- **No learning from historical student outcomes**
  - The system does not currently adapt based on real student success, dropouts, or satisfaction.
  - Every decision is computed fresh from structured rules.
  - This avoids bias from noisy data, but also limits feedback-driven improvement.

- **Static criterion scores**
  - Course scores are predefined and manually structured.
  - They do not automatically respond to job market fluctuations or policy changes.
  - Stability was prioritized over dynamic external dependencies.


---

### Where PathFinder can evolve next

The architecture was intentionally kept modular to allow structured growth.

- **From heuristic scoring to data-driven calibration**
  - Introduce anonymized counselling or placement datasets.
  - Adjust matrix values based on observed patterns.
  - Preserve transparency while increasing empirical grounding.

- **From fixed weights to adaptive weight learning**
  - Detect common preference patterns across users.
  - Suggest optimized weight presets based on usage clusters.
  - Keep manual override as a permanent feature.

- **From static course data to dynamic market integration**
  - Integrate updated salary trends, job demand, and exam data.
  - Periodically refresh scoring inputs.
  - Maintain clear separation between external data and ranking logic.

- **From decision moment to outcome tracking**
  - If deployed institutionally, measure long-term satisfaction.
  - Study decision stability and academic outcomes.
  - Use insights to refine the framework responsibly.


---

### Closing thoughts

In practical terms, PathFinder now delivers three concrete outcomes: a **guided decision journey** that takes a student from stream and subject combination to a list of ranked courses, a **transparent scoring engine** where criteria and weights are visible and adjustable, and a **flexible comparison mode** (Career Duel) for cases where the student already has specific options to weigh up. Throughout the build, the focus stayed on keeping the logic deterministic, explainable, and inspectable so that students, parents, and counsellors can see how recommendations are produced and adjust them when needed.