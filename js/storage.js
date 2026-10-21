// Saves and loads tickets in localStorage, so the board survives a page refresh.

const STORAGE_KEY = 'help-desk-lite.tickets';

// Returns null when nothing usable is saved, so the app knows to load the sample tickets
export function loadTickets() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      return null;
    }
    const tickets = JSON.parse(saved);
    return Array.isArray(tickets) ? tickets : null;
  } catch (error) {
    // Blocked storage (some private windows) or damaged JSON: start fresh instead of crashing
    return null;
  }
}

export function saveTickets(tickets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch (error) {
    // If saving fails the app still works, the tickets just won't survive a refresh
  }
}
