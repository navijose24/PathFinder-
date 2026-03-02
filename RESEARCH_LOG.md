### Project Name: PathFinder – A Decision Companion System (DCS)

## Research Goal:
    To design and develop an explainable, rule-based Decision Companion System that helps +2 students select post-secondary courses using structured criteria weighting, transparent ranking, and interpretable logic.


---


## Date Started: 2026-02-15


- **Project Overview & Scope**
  - Question: Can a transparent, Decision Companion System provide explainable, adaptable, and non-static course recommendations without relying on black-box AI models?
  - Keywords: Decision Companion System (DCS), Decision Support System (DSS), rule-based scoring engine, weighted scoring model, explainable AI, multi-criteria decision making (MCDM), criteria weighting, tie-breaker logic, course recommendation system, dynamic ranking system.
  - Current Status: Active


- **Methodology & Parameters**
    - Data Searched:
        - Google (concept validation & comparisons)
        - HSSLiVE.IN (Higher Secondary subject Combinations)
        - ChatGPT (MCDM methods and detailed ideation)
        -Gemini-Deep research (Detailed Overview of DCS)
    - Inclusion Criteria:
        - Explainable decision frameworks
        - Deterministic ranking systems
        - Systems allowing user-adjustable weights
    - Exclusion Criteria:
        - Black-box neural network recommenders
        - Static hard-coded comparisons
        - Systems without transparency in scoring

---
- **2026-02-15 – Concept Clarification**
    - Goal: Understand difference between DCS and DSS and define system direction
    - Google Search Queries:
        - Decision Companion System vs Decision Support System
        - Explainable decision system architecture
        - Multi criteria decision making examples
        - Linear weighted sum model decision making
        - Transparent AI decision systems
    - AI Prompts Used:
        - What’s the difference b/w DSS and DCS?
        - What DCS system should I build for a thesis?
        - What features should a Decision Companion System include?
        - How can I make a scoring-based system explainable?
        - Can you combine problem statement, evaluation criteria and deliverables into one structured explanation?
    - Accepted:
        - Focus on explainable scoring model.
        - Companion-style guided interaction instead of analytical dashboard.
        - Multi-Criteria Decision Making (MCDM) as core logic.
        - Real-life education domain problem.
    - Rejected:
        - Pure DSS analytics model.
        - Black-box AI recommendation approach.
    - Impact on Thesis:
        - Established transparency, adaptability, and explainability as core pillars.

---

- **2026-02-18 – Problem Framing**
    - Goal: Finalise a concrete, implementable problem.
    - Google Search Queries:
        - Problems faced by +2 students after school
        - Career confusion after higher secondary
        - Course selection decision problems
        - Education recommendation system design
    - AI Prompts Used:
        - Suggest real-world problems suitable for a Decision Companion System.
        - Is course selection after +2 a strong thesis problem?
        - How to structure a student decision flow system?
        - What makes a recommendation system explainable instead of black-box?
    - Finalised Problem Understanding:
        - Build a Decision Companion System that helps +2 students choose what to study next.
        - Start from the student’s context (stream and subject combination).
        - Collect preferences and constraints using a guided questionnaire.
        - Convert responses into structured decision criteria and weights.
        - Use a transparent scoring and ranking engine to compare courses.
        - Provide ranked recommendations with charts and explanations.
        - Include a “Career Duel” mode for comparing custom options.
        - Ensure the system is explainable, interactive, and adaptable — not static and not a black-box AI model.
    - Accepted:
        - Focus on post +2 course selection as core domain.
        - Criteria-based structured evaluation.
    - Rejected:
        - Generic undecided domain problems.
        - Fully AI-driven predictive model.
    - Impact on Thesis:
        - Clearly defined system scope, users, and boundaries.

---

- **2026-02-22 – Static vs Dynamic Logic Analysis**
    - Goal: Ensure the system logic is dynamic and not hard-coded.
    - Google Search Queries:
        - Rule based scoring engine vs hard coded logic
        - Linear weighted sum model explanation
        - Dynamic ranking system design
        - Difference between decision tree and scoring model
    - AI Prompts Used:
        - If I use if-else elimination logic, will my system be static?
        - What is a rule-based scoring engine?
        - Explain Linear Weighted Sum Model with example.
        - How can ranking change dynamically based on user input?
    - Accepted:
        - Linear Weighted Sum Model:
            - `Final Score = Σ (criterion_score × user_weight)`
        - User-adjustable weights.
        - Dynamic ranking recalculation per session.
        - Backend-controlled scoring logic.
    - Rejected:
        - Fixed decision trees.
        - Static elimination rules.
        - Hard-coded comparison tables.
    - Impact on Thesis:
        - Confirmed system dynamism through weight-driven adaptability.

---

- **2026-02-27 – Data Modelling & Course Matrix**
    - Goal: Design scalable backend structure for streams and courses.
    - Google Search Queries:
        - JSON vs relational database for recommendation system
        - Heuristic scoring matrix design
        - Course recommendation data structure design
        - Config-driven backend architecture
    - AI Prompts Used:
        - Instead of JSON config, what scalable options do I have?
        - If I have 300+ courses, how should I structure scoring?
        - Do I need attributes defined manually for every course?
        - How to design a criteria scoring matrix?
    - Accepted:
        - Backend-managed streams and subject combinations.
        - Predefined heuristic course–criteria scoring matrix.
        - Database-driven configuration.
        - Criteria normalization strategy.
    - Rejected:
        - Manual frontend comparison logic.
        - ML prediction-based scoring.
    - Impact on Thesis:
        - Ensured scalability, maintainability, and auditability of decision logic.

---

- **2026-02-28 – Multi-Step Flow Architecture + Backend API Design**
    - Goal: Build structured and maintainable system architecture.
    - Google Search Queries:
        - Multi step form architecture React
        - Global state management React reducer pattern
        - Django REST recommendation system backend
        - Separation of concerns frontend backend architecture
    - AI Prompts Used:
        - Should ranking logic stay in frontend or backend?
        - How to design a multi-step decision flow?
        - What state variables should be tracked in a DCS?
        - How to design API endpoints for scoring and ranking?
    - Accepted (Frontend Architecture):
        - React with global `DecisionContext` using Reducer pattern.
        - Single state object tracking:
            - Stream
            - Combination
            - Answers
            - Weights
            - Rankings
            - Explanation
    - Accepted (Backend Architecture):
        - Django + Django REST Framework.
        - Backend handles:
            - Course configuration
            - Weight normalization
            - Ranking computation
            - Explanation logic trigger
    - Rejected:
        - Fragmented local component state.
        - Business logic inside frontend.
    - Impact on Thesis:
        - Achieved modular, maintainable, production-ready structure.

---

- **2026-03-02 – Career Duel Mode Design + AI Explanation Layer**
    - Goal: Extend flexibility and improve explanation clarity.
    - Google Search Queries:
        - Comparative decision making systems
        - Pairwise comparison model decision making
        - AI explanation generation for scoring systems
        - Hybrid AI deterministic architecture
    - AI Prompts Used:
        - How to design a “Career Duel” comparison mode?
        - Should AI handle ranking or only explanation?
        - How to keep AI from breaking transparency?
        - How to implement fallback explanation if AI fails?
    - Accepted (Career Duel Mode):
        - User-defined custom comparison options.
        - Minimum two options required.
        - Same weighted scoring logic applied.
        - Dynamic ranking output.
    - Accepted (AI Explanation Layer):
        - AI generates natural-language reasoning only.
        - Deterministic ranking remains untouched.
        - Fallback rule-based explanation if AI unavailable.
    - Rejected:
        - AI-controlled ranking logic.
        - Dependency on AI for core functionality.
    - Impact on Thesis:
        - Balanced transparency with intelligent explanation layer.
        - Strengthened explainability and usability of the system.