export const CRITERION_LABELS = {
  stability: "Job Security",
  analytical: "Problem-Solving",
  income_priority: "Salary",
  years_willing: "How Long I Can Study",
  financial_support: "My Financial Capacity",
  competitive_confidence: "Competitive Exams",
  sector_preference: "Field I Want to Work In",
  research_interest: "Interest in Research",
  stress_tolerance: "Can I Handle Stress Well",
};

export function formatCriterionLabel(key) {
  if (!key) return "";
  return CRITERION_LABELS[key] || key.replace(/_/g, " ");
}

