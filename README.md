## PathFinder – Decision Companion System

### Problem understanding

PathFinder is a **decision companion system** that helps a student after +2 choose **what to study next**.  
The system:

- **Starts from the student’s context**: which stream they belong to and what subject combination they have.
- **Collects their preferences and constraints** via a guided questionnaire.
- **Translates answers into decision criteria and weights** (e.g. job stability, salary, study duration).
- Uses a transparent **scoring and ranking engine** to compare many courses.
- Provides a **ranked recommendation** plus **charts and explanations** so the user sees *why* a course is suggested.
- Offers a generic **“Career Duel”** mode where the user can compare any custom set of courses.

The goal is to be **explainable, interactive and adaptable** rather than a static comparison or a pure AI black box.

---

### Assumptions

- **User**
  - Primary user is a **+2 student** deciding on a **course / career path**.
  - Users can read simple English and are comfortable answering short questionnaires.

- **Data & scoring**
  - Streams, subject combinations and courses are pre‑configured in the backend.
  - Each course has **heuristic scores** for multiple criteria (e.g. stability, salary, study duration).
  - A **linear weighted sum** of criterion scores is a reasonable first approximation for ranking.

- **AI usage**
  - AI is *not required* for core decision logic.
  - AI is only used (when available) to generate **natural‑language explanations** of why a top recommendation fits the user.
  - The system must still work (with deterministic text) when no AI key is configured.

---

### Why this structure?

- **Single global decision state**
  - Implemented via a React `DecisionContext` (with a reducer) that tracks:
    - Stream, subject combination, questions, answers, weights, rankings and explanations.
  - **Benefit**: keeps the multi‑step journey consistent, avoids prop drilling and makes state transitions explicit.

- **Two complementary decision modes**
  - **Discovery Journey** – A guided recommender inside curated streams and courses:
    - Domain selection → subject combination → questionnaire → weights → ranking and explanation.
  - **Career Duel** – A generic comparator:
    - User types arbitrary options (e.g. “BSc CS”, “BCA”, “Design”) and scores them across a small set of reflective questions.
  - **Benefit**: covers both “I have no idea” and “I’m torn between a few options” without overloading one flow.

- **Explainable linear model**
  - Courses are scored on several criteria; user weights express importance of each criterion.
  - Final course score is a **weighted sum** – simple to reason about and visualise.
  - **Benefit**: every part of the decision (criteria, weights, scores) can be shown directly to the user.

- **Backend‑driven configuration, frontend‑driven tweaks**
  - Backend owns:
    - Streams, combinations, questions and base course–criteria scores.
  - Frontend lets the user **tune criteria weights** via sliders, then normalises them for ranking.
  - **Benefit**: domain experts can tune backend data while users retain control over what matters to them.

- **AI only as an explainer**
  - AI (via Gemini) is only called to turn structured facts (top course, criteria, weights) into **friendly text**.
  - If AI is unavailable, the backend returns a deterministic fallback explanation.
  - **Benefit**: logic remains deterministic and auditable; AI only improves UX.

---

### Design decisions & trade‑offs

- **React + Context for the multi‑step flow**
  - **Decision**: Use React with a central `DecisionContext` instead of multiple local states.
  - **Trade‑off**: Slightly more boilerplate, but much clearer control over a long, multi‑screen decision journey.

- **Django + DRF backend**
  - **Decision**: Use Django REST Framework to expose streams, combinations, questions, weight calculation and ranking endpoints.
  - **Trade‑off**: Heavier than a simple script, but provides a clean API boundary and room for future admin / authentication features.

- **Heuristic course matrix instead of ML**
  - **Decision**: Use a predefined course–criteria matrix (built by `create_matrix.js`) with rule‑based scores.
  - **Trade‑off**: Less “smart” than learned models, but easy to audit, adjust and explain.

- **Optional AI explanations**
  - **Decision**: Keep AI calls optional and behind a single service (`gemini_service.py`) with a robust fallback.
  - **Trade‑off**: Explanations may be less rich without AI, but the system never breaks when AI is unavailable.

---

### Edge cases considered

- **Incomplete questionnaire**
  - Weight calculation is blocked until all questions are answered; a clear message prompts the user to finish.

- **Missing or zero weights**
  - Rankings are disabled until user weights exist.
  - Normalisation logic handles the case where all sliders are 0 by falling back to equal weights.

- **Tied course scores**
  - Joint top courses are recognised when scores are equal within a small epsilon.
  - A **tie‑breaker criterion** (e.g. highest‑priority user criterion) is used to suggest a single top course when needed.

- **AI unavailable or failing**
  - If `GEMINI_API_KEY` is missing or the Gemini call fails, the system uses a deterministic fallback explanation.
  - Users always receive some explanation; AI issues are not exposed in the UI.

- **Career Duel validations**
  - Requires at least two options to compare.
  - Forces each option to be scored on each question before advancing.
  - Safely handles missing scores in the ranking and comparison table.

---

### How to run the project

#### Prerequisites

- **Python** 3.11+  
- **Node.js** 18+ and **npm** or **yarn**  
- (Optional) A **Google Gemini API key** for AI explanations

#### Backend (Django + DRF)

From the project root:

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
source .venv/Scripts/activate  # Windows (Git Bash)
# or:
# .venv\Scripts\activate.bat   # Windows cmd
# source .venv/bin/activate    # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply migrations
cd backend
python manage.py migrate

# 4. (Optional) Configure AI explanation
# Set GEMINI_API_KEY in your environment if you want AI-generated explanations.
export GEMINI_API_KEY="your_api_key_here"      # macOS/Linux
set GEMINI_API_KEY=your_api_key_here           # Windows

# 5. Run the backend
python manage.py runserver 0.0.0.0:8000
```

The API will be available at `http://localhost:8000`.

#### Frontend (React + Vite)

In another terminal, from the project root:

```bash
cd frontend

# 1. Install dependencies
npm install
# or: yarn

# 2. Configure API base URL for the frontend
# Create a .env file in frontend/ with:
# VITE_API_BASE_URL=http://localhost:8000

# 3. Run the dev server
npm run dev
# or: yarn dev
```

Open the URL printed by Vite (typically `http://localhost:5173`) in your browser.

---

### Future improvements

- **Deeper transparency**
  - Add a “How the ranking works” section with a simple formula and examples.
  - Show a sensitivity view: how rankings change when key weights are moved.

- **Richer criterion support**
  - Tooltips and descriptions for each criterion.
  - Optional hiding/adding of criteria (starting in Career Duel).

- **Config‑driven decision engine**
  - Move heuristic scoring rules into editable config files with validation and tests.

- **Persistence and analytics**
  - Allow users to save and resume journeys.
  - Aggregate anonymous data to learn which criteria usually drive decisions.

- **Testing & accessibility**
  - Add unit tests for weight and ranking engines and key components.
  - Improve keyboard navigation, ARIA attributes and localisation support.
  

