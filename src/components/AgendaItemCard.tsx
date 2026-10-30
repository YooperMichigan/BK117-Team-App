import { useEffect, useState } from 'react';
import type { AgendaItem, AgendaItemPatch, CheckPilot } from '../../shared/types.ts';
import { formatDate } from '../format';

interface Props {
  item: AgendaItem;
  start: string;
  pilots: CheckPilot[];
  readOnly: boolean;
  isFirst: boolean;
  isLast: boolean;
  onPatch: (patch: AgendaItemPatch) => void;
  onMove: (direction: 'up' | 'down') => void;
  onDelete: () => void;
}

const STATUS_LABEL = { open: 'Open', discussed: 'Discussed', carried: 'Carried' } as const;

export function AgendaItemCard({ item, start, pilots, readOnly, isFirst, isLast, onPatch, onMove, onDelete }: Props) {
  const [notes, setNotes] = useState(item.notes);
  useEffect(() => setNotes(item.notes), [item.notes]);
  const locked = readOnly || item.status === 'carried';

  return (
    <li className={`card agenda-item status-${item.status}`}>
      <div className="item-top">
        <span className="item-time">{start}</span>
        <div className="item-main">
          <div className="item-title">{item.title}</div>
          <div className="muted small">
            {item.presenterName ?? 'No presenter'} · {item.minutes} min
            {item.carriedFromDate && <> · carried from {formatDate(item.carriedFromDate)}</>}
          </div>
        </div>
        <span className={`badge badge-${item.status}`}>{STATUS_LABEL[item.status]}</span>
      </div>

      {locked ? (
        item.notes && <p className="item-notes">{item.notes}</p>
      ) : (
        <>
          <div className="row item-edit">
            <label className="small">Presenter
              <select value={item.presenterId ?? ''} onChange={(e) => onPatch({ presenterId: e.target.value ? Number(e.target.value) : null })}>
                <option value="">None</option>
                {pilots.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label className="small">Minutes
              <input type="number" min={1} max={240} value={item.minutes}
                onChange={(e) => { const n = Number(e.target.value); if (Number.isInteger(n) && n >= 1 && n <= 240) onPatch({ minutes: n }); }} />
            </label>
          </div>
          <textarea
            className="notes"
            placeholder="Notes"
            value={notes}
            maxLength={4000}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => notes !== item.notes && onPatch({ notes })}
          />
          <div className="row">
            <button className="button primary" onClick={() => onPatch({ status: item.status === 'discussed' ? 'open' : 'discussed' })}>
              {item.status === 'discussed' ? 'Reopen' : 'Mark discussed'}
            </button>
            <button className="button icon" aria-label="Move up" disabled={isFirst} onClick={() => onMove('up')}>↑</button>
            <button className="button icon" aria-label="Move down" disabled={isLast} onClick={() => onMove('down')}>↓</button>
            <button className="button danger" onClick={() => confirm(`Delete "${item.title}"?`) && onDelete()}>Delete</button>
          </div>
        </>
      )}
    </li>
  );
}
