export type RatingSummary = {
  review_count: number;
  avg_communication: number | null;
  avg_condition: number | null;
  avg_instructions: number | null;
  avg_overall: number | null;
};

export function emptyRating(): RatingSummary {
  return {
    review_count: 0,
    avg_communication: null,
    avg_condition: null,
    avg_instructions: null,
    avg_overall: null,
  };
}

export function formatStars(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return "No ratings yet";
  return `${Number(value).toFixed(1)} / 5`;
}
