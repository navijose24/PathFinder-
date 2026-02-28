import React, { createContext, useContext, useReducer } from "react";

const DecisionContext = createContext(null);

const initialState = {
  domain: null,
  domains: [],
  combinations: [],
  selectedCombination: null,
  questions: [],
  answers: {}, // {questionId: value}
  weights: {
    raw_scores: {},
    normalized_weights: {},
    primary_criteria: ["stability", "analytical", "income_priority", "years_willing"],
    sorted_criteria: [],
  },
  userWeights: {}, // editable normalized weights
  ranking: null,
  explanation: null,
};

function decisionReducer(state, action) {
  switch (action.type) {
    case "SET_DOMAINS":
      return { ...state, domains: action.payload };
    case "SET_DOMAIN":
      return {
        ...state,
        domain: action.payload,
        combinations: [],
        selectedCombination: null,
        questions: [],
        answers: {},
        weights: { ...initialState.weights },
        userWeights: {},
        ranking: null,
        explanation: null,
      };
    case "SET_COMBINATIONS":
      return { ...state, combinations: action.payload };
    case "SET_COMBINATION":
      return {
        ...state,
        selectedCombination: action.payload,
        ranking: null,
        explanation: null,
      };
    case "SET_QUESTIONS":
      return { ...state, questions: action.payload };
    case "SET_ANSWERS":
      return { ...state, answers: action.payload };
    case "SET_WEIGHTS":
      return {
        ...state,
        weights: {
          raw_scores: action.payload.raw_scores,
          normalized_weights: action.payload.normalized_weights,
          primary_criteria:
            action.payload.primary_criteria || state.weights.primary_criteria,
          sorted_criteria: action.payload.sorted_criteria,
        },
        userWeights: action.payload.normalized_weights,
      };
    case "SET_USER_WEIGHTS":
      return {
        ...state,
        userWeights: action.payload,
      };
    case "SET_RANKING":
      return { ...state, ranking: action.payload };
    case "SET_EXPLANATION":
      return { ...state, explanation: action.payload };
    default:
      return state;
  }
}

export function DecisionProvider({ children }) {
  const [state, dispatch] = useReducer(decisionReducer, initialState);

  return (
    <DecisionContext.Provider value={{ state, dispatch }}>
      {children}
    </DecisionContext.Provider>
  );
}

export function useDecision() {
  const ctx = useContext(DecisionContext);
  if (!ctx) {
    throw new Error("useDecision must be used within DecisionProvider");
  }
  return ctx;
}

