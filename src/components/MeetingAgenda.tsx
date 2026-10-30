import { useEffect, useState } from 'react';
import type { AgendaItemPatch, CarryOverResult, CheckPilot, Meeting } from '../../shared/types.ts';
import { api } from '../api';
import { addMinutes, formatDate, formatDuration } from '../format';
import { AgendaItemCard } from './AgendaItemCard';
import { AddItemForm } from './AddItemForm';

interface Props {
  meetingId: number;
  pilots: CheckPilot[];
  /** Called after any change so the meeting list can refresh its counts. */
  onChanged: () => void;
  onOpenMeeting: (id: number) => void;
}

export function MeetingAgenda({ meetingId, pilots, onChanged, onOpenMeeting }: Props) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; meetingId?: number } | null>(null);

  useEffect(() => {
    api.get<Meeting>(`/api/meetings/${meetingId}`).then(setMeeting, (e: Error) => setError(e.message));
  }, [meetingId]);

  /** Runs a change that returns the updated meeting. */
  async function change(run: () => Promise<Meeting>) {
    setError(null);
    setNotice(null);
    try {
      setMeeting(await run());
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function carryOver() {
    setError(null);
    try {
      const r = await api.post<CarryOverResult>(`/api/meetings/${meetingId}/carry-over`);
      setMeeting(await api.get<Meeting>(`/api/meetings/${meetingId}`));
      onChanged();
      setNotice(r.carried
        ? { text: `Carried ${r.carried} item${r.carried === 1 ? '' : 's'} to the next meeting.`, meetingId: r.toMeetingId }
        : { text: 'No open items to carry.' });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!meeting) return error ? <p className="error">{error}</p> : <p className="muted">Loading…</p>;

  const held = meeting.status === 'held';
  const openCount = meeting.items.filter((i) => i.status === 'open').length;
  let clock = meeting.startTime;

  return (
    <section>
      <div className="agenda-header">
        <div>
          <h2>{meeting.title}</h2>
          <div className="muted">
            {formatDate(meeting.date)} · {meeting.startTime}–{addMinutes(meeting.startTime, meeting.totalMinutes)} ({formatDuration(meeting.totalMinutes)})
            {meeting.location && <> · {meeting.location}</>}
          </div>
        </div>
        {held && <span className="badge">Held</span>}
      </div>

      {error && <p className="error">{error}</p>}
      {notice && (
        <p className="notice">
          {notice.text}{' '}
          {notice.meetingId && <button className="link" onClick={() => onOpenMeeting(notice.meetingId!)}>Open it</button>}
        </p>
      )}

      <ol className="agenda">
        {meeting.items.map((item) => {
          const start = clock;
          clock = addMinutes(clock, item.minutes);
          return (
            <AgendaItemCard
              key={item.id}
              item={item}
              start={start}
              pilots={pilots}
              readOnly={held}
              isFirst={item === meeting.items[0]}
              isLast={item === meeting.items[meeting.items.length - 1]}
              onPatch={(patch: AgendaItemPatch) => change(() => api.patch<Meeting>(`/api/items/${item.id}`, patch))}
              onMove={(direction) => change(() => api.post<Meeting>(`/api/items/${item.id}/move`, { direction }))}
              onDelete={() => change(() => api.del<Meeting>(`/api/items/${item.id}`))}
            />
          );
        })}
      </ol>
      {meeting.items.length === 0 && <p className="muted">No agenda items yet.</p>}

      {!held && (
        <>
          <AddItemForm pilots={pilots} onAdd={(item) => change(() => api.post<Meeting>(`/api/meetings/${meetingId}/items`, item))} />
          <div className="row actions">
            <button className="button" disabled={openCount === 0} onClick={carryOver}>
              Carry {openCount} open item{openCount === 1 ? '' : 's'} to next meeting
            </button>
            <button
              className="button"
              onClick={() => {
                if (openCount === 0 || confirm(`${openCount} item(s) are still open. Mark held anyway? They will not carry over.`)) {
                  change(() => api.post<Meeting>(`/api/meetings/${meetingId}/held`));
                }
              }}
            >
              Mark held
            </button>
          </div>
        </>
      )}
      {held && meeting.items.some((i) => i.status === 'carried') && (
        <p className="muted small">Items marked "Carried" moved to a later meeting.</p>
      )}
    </section>
  );
}
