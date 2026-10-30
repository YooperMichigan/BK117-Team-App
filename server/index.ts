import express from 'express';
import type { Request, Response } from 'express';
import type {
  AgendaItem, AgendaItemPatch, CarryOverResult, CheckPilot, Meeting, MeetingSummary, NewAgendaItem, NewMeeting,
  SampleResponse,
} from '../shared/types.ts';
import { PORT } from './config.ts';
import { db, dbPath } from './db.ts';

const app = express();
app.use(express.json({ limit: '16kb' }));

/** Every POC response is marked as sample data so the UI can say so. */
const sample = <T>(data: T): SampleResponse<T> => ({ sample: true, data });

class BadRequest extends Error {}

const text = (v: unknown, field: string, { required = true, max = 2000 } = {}): string => {
  if (typeof v !== 'string' || (required && !v.trim()) || v.length > max) throw new BadRequest(`Invalid ${field}`);
  return v.trim();
};
const minutes = (v: unknown): number => {
  if (!Number.isInteger(v) || (v as number) < 1 || (v as number) > 240) throw new BadRequest('Minutes must be 1 to 240');
  return v as number;
};
const presenter = (v: unknown): number | null => {
  if (v === null) return null;
  if (!Number.isInteger(v) || !db.prepare('SELECT 1 FROM check_pilots WHERE id = ?').get(v)) throw new BadRequest('Unknown presenter');
  return v as number;
};
const id = (req: Request) => Number(req.params.id);

const MEETING_COLUMNS = `
  m.id, m.title, m.meeting_date AS date, m.start_time AS startTime, m.location, m.status,
  COUNT(a.id) AS itemCount, COALESCE(SUM(a.minutes), 0) AS totalMinutes
  FROM meetings m LEFT JOIN agenda_items a ON a.meeting_id = m.id`;

const getMeetingSummary = (meetingId: number) =>
  db.prepare(`SELECT ${MEETING_COLUMNS} WHERE m.id = ? GROUP BY m.id`).get(meetingId) as MeetingSummary | undefined;

const getItems = (meetingId: number) =>
  db.prepare(`
    SELECT a.id, a.meeting_id AS meetingId, a.position, a.title, a.presenter_id AS presenterId, p.name AS presenterName,
           a.minutes, a.notes, a.status, src_m.meeting_date AS carriedFromDate
    FROM agenda_items a
    LEFT JOIN check_pilots p ON p.id = a.presenter_id
    LEFT JOIN agenda_items src ON src.id = a.carried_from_id
    LEFT JOIN meetings src_m ON src_m.id = src.meeting_id
    WHERE a.meeting_id = ? ORDER BY a.position`).all(meetingId) as AgendaItem[];

const getItemMeeting = (itemId: number) =>
  db.prepare('SELECT m.id, m.status FROM agenda_items a JOIN meetings m ON m.id = a.meeting_id WHERE a.id = ?')
    .get(itemId) as { id: number; status: string } | undefined;

/** Sends the full meeting, or 404s. */
function sendMeeting(res: Response, meetingId: number) {
  const summary = getMeetingSummary(meetingId);
  if (!summary) {
    res.status(404).json({ error: 'Meeting not found' });
    return;
  }
  res.json(sample<Meeting>({ ...summary, items: getItems(meetingId) }));
}

/** Held meetings are the record of what was discussed; their agendas no longer change. */
function rejectIfHeld(res: Response, meeting: { status: string } | undefined): boolean {
  if (!meeting) {
    res.status(404).json({ error: 'Not found' });
    return true;
  }
  if (meeting.status === 'held') {
    res.status(409).json({ error: 'This meeting has been held; its agenda is read-only' });
    return true;
  }
  return false;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/check-pilots', (_req, res) => {
  res.json(sample(db.prepare('SELECT id, name FROM check_pilots ORDER BY id').all() as CheckPilot[]));
});

// Upcoming meetings soonest first, then held meetings most recent first.
app.get('/api/meetings', (_req, res) => {
  const rows = db.prepare(`SELECT ${MEETING_COLUMNS} GROUP BY m.id
    ORDER BY m.status = 'held',
             CASE WHEN m.status = 'held' THEN -julianday(m.meeting_date) ELSE julianday(m.meeting_date) END,
             m.start_time`).all();
  res.json(sample(rows as MeetingSummary[]));
});

app.post('/api/meetings', (req, res) => {
  const b = req.body as Partial<NewMeeting>;
  const date = text(b.date, 'date');
  const startTime = text(b.startTime, 'start time');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(startTime)) throw new BadRequest('Invalid date or time');
  const r = db.prepare('INSERT INTO meetings (title, meeting_date, start_time, location) VALUES (?, ?, ?, ?)')
    .run(text(b.title, 'title', { max: 200 }), date, startTime, text(b.location ?? '', 'location', { required: false, max: 200 }));
  res.status(201);
  sendMeeting(res, Number(r.lastInsertRowid));
});

app.get('/api/meetings/:id', (req, res) => {
  sendMeeting(res, id(req));
});

app.post('/api/meetings/:id/held', (req, res) => {
  const meeting = db.prepare('SELECT id, status FROM meetings WHERE id = ?').get(id(req)) as { status: string } | undefined;
  if (rejectIfHeld(res, meeting)) return;
  db.prepare("UPDATE meetings SET status = 'held' WHERE id = ?").run(id(req));
  sendMeeting(res, id(req));
});

app.post('/api/meetings/:id/items', (req, res) => {
  const meetingId = id(req);
  const meeting = db.prepare('SELECT id, status FROM meetings WHERE id = ?').get(meetingId) as { status: string } | undefined;
  if (rejectIfHeld(res, meeting)) return;
  const b = req.body as Partial<NewAgendaItem>;
  const values = [text(b.title, 'title', { max: 200 }), presenter(b.presenterId ?? null), minutes(b.minutes)];
  db.prepare(`INSERT INTO agenda_items (meeting_id, position, title, presenter_id, minutes)
    VALUES (?, (SELECT COALESCE(MAX(position), 0) + 1 FROM agenda_items WHERE meeting_id = ?), ?, ?, ?)`)
    .run(meetingId, meetingId, ...values);
  res.status(201);
  sendMeeting(res, meetingId);
});

// Copies every open item to the next upcoming meeting and marks the originals carried.
app.post('/api/meetings/:id/carry-over', (req, res) => {
  const from = db.prepare('SELECT id, status, meeting_date, start_time FROM meetings WHERE id = ?')
    .get(id(req)) as { id: number; status: string; meeting_date: string; start_time: string } | undefined;
  if (rejectIfHeld(res, from)) return;
  const to = db.prepare(`SELECT id FROM meetings WHERE status = 'upcoming' AND id != ?
      AND meeting_date || start_time > ? ORDER BY meeting_date, start_time LIMIT 1`)
    .get(from!.id, from!.meeting_date + from!.start_time) as { id: number } | undefined;
  if (!to) {
    res.status(409).json({ error: 'No later meeting to carry items to. Create the next meeting first.' });
    return;
  }
  const open = db.prepare("SELECT id, title, presenter_id, minutes FROM agenda_items WHERE meeting_id = ? AND status = 'open' ORDER BY position")
    .all(from!.id) as { id: number; title: string; presenter_id: number | null; minutes: number }[];
  db.transaction(() => {
    for (const item of open) {
      db.prepare(`INSERT INTO agenda_items (meeting_id, position, title, presenter_id, minutes, carried_from_id)
        VALUES (?, (SELECT COALESCE(MAX(position), 0) + 1 FROM agenda_items WHERE meeting_id = ?), ?, ?, ?, ?)`)
        .run(to.id, to.id, item.title, item.presenter_id, item.minutes, item.id);
      db.prepare("UPDATE agenda_items SET status = 'carried' WHERE id = ?").run(item.id);
    }
  })();
  res.json(sample<CarryOverResult>({ carried: open.length, toMeetingId: to.id }));
});

app.patch('/api/items/:id', (req, res) => {
  const meeting = getItemMeeting(id(req));
  if (rejectIfHeld(res, meeting)) return;
  const b = req.body as AgendaItemPatch;
  const sets: Record<string, unknown> = {};
  if ('title' in b) sets.title = text(b.title, 'title', { max: 200 });
  if ('presenterId' in b) sets.presenter_id = presenter(b.presenterId);
  if ('minutes' in b) sets.minutes = minutes(b.minutes);
  if ('notes' in b) sets.notes = text(b.notes, 'notes', { required: false, max: 4000 });
  if ('status' in b) {
    if (b.status !== 'open' && b.status !== 'discussed') throw new BadRequest('Status must be open or discussed');
    sets.status = b.status;
  }
  const cols = Object.keys(sets);
  if (cols.length) {
    db.prepare(`UPDATE agenda_items SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`).run(...Object.values(sets), id(req));
  }
  sendMeeting(res, meeting!.id);
});

app.post('/api/items/:id/move', (req, res) => {
  const meeting = getItemMeeting(id(req));
  if (rejectIfHeld(res, meeting)) return;
  const direction = (req.body as { direction?: string }).direction;
  if (direction !== 'up' && direction !== 'down') throw new BadRequest('Direction must be up or down');
  const item = db.prepare('SELECT id, position FROM agenda_items WHERE id = ?').get(id(req)) as { id: number; position: number };
  const neighbour = db.prepare(`SELECT id, position FROM agenda_items WHERE meeting_id = ? AND position ${direction === 'up' ? '<' : '>'} ?
    ORDER BY position ${direction === 'up' ? 'DESC' : 'ASC'} LIMIT 1`).get(meeting!.id, item.position) as { id: number; position: number } | undefined;
  if (neighbour) {
    db.transaction(() => {
      db.prepare('UPDATE agenda_items SET position = ? WHERE id = ?').run(neighbour.position, item.id);
      db.prepare('UPDATE agenda_items SET position = ? WHERE id = ?').run(item.position, neighbour.id);
    })();
  }
  sendMeeting(res, meeting!.id);
});

app.delete('/api/items/:id', (req, res) => {
  const meeting = getItemMeeting(id(req));
  if (rejectIfHeld(res, meeting)) return;
  db.prepare('DELETE FROM agenda_items WHERE id = ?').run(id(req));
  sendMeeting(res, meeting!.id);
});

app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  if (err instanceof BadRequest) {
    res.status(400).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[bk117] API on http://127.0.0.1:${PORT} (db: ${dbPath})`);
});
