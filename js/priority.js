// Priority lookup: turns impact and urgency into P1-P4, in the style of an ITIL priority matrix.

// A table instead of a formula, so anyone can read and change the rules at a glance
const PRIORITY_MATRIX = {
  single: { low: 'P4', medium: 'P3', high: 'P3' },
  team: { low: 'P3', medium: 'P2', high: 'P2' },
  office: { low: 'P2', medium: 'P1', high: 'P1' },
};

// Returns null until both values are picked, so the form can show "not set yet"
export function getPriority(impact, urgency) {
  const row = PRIORITY_MATRIX[impact];
  if (!row || !row[urgency]) {
    return null;
  }
  return row[urgency];
}
