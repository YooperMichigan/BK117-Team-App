/** "2026-11-02" -> "Mon, Nov 2, 2026" (parsed as a local date, not UTC). */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

/** Adds minutes to a 24h "HH:MM" clock time. */
export function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = (h * 60 + m + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  return h ? `${h} h ${minutes % 60} min` : `${minutes} min`;
}
