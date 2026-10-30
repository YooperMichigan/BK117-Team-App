import type { MeetingSummary } from '../../shared/types.ts';
import { formatDate, formatDuration } from '../format';

interface Props {
  meetings: MeetingSummary[];
  selected: number | 'new' | null;
  onSelect: (id: number | 'new') => void;
}

export function MeetingList({ meetings, selected, onSelect }: Props) {
  const groups = [
    { label: 'Upcoming', items: meetings.filter((m) => m.status === 'upcoming') },
    { label: 'Past', items: meetings.filter((m) => m.status === 'held') },
  ];
  return (
    <nav className="meeting-list" aria-label="Meetings">
      <button className="button primary block" onClick={() => onSelect('new')}>New meeting</button>
      {groups.map((g) => (
        <section key={g.label}>
          <h2 className="list-heading">{g.label}</h2>
          {g.items.length === 0 && <p className="muted small">None</p>}
          {g.items.map((m) => (
            <button key={m.id} className={m.id === selected ? 'meeting-link active' : 'meeting-link'} onClick={() => onSelect(m.id)}>
              <span className="meeting-date">{formatDate(m.date)}</span>
              <span className="muted small">
                {m.startTime} · {m.itemCount} item{m.itemCount === 1 ? '' : 's'} · {formatDuration(m.totalMinutes)}
              </span>
            </button>
          ))}
        </section>
      ))}
    </nav>
  );
}
