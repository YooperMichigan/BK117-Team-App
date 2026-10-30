// Rebuilds the local database from mock-data/. Safe to re-run: it clears every table first.
// Meeting dates are relative to today so the sample always has a past and upcoming meetings.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { db, dbPath, root } from '../server/db.ts';

interface MockItem { title: string; presenter: string | null; minutes: number; status: string; notes: string }
interface MockMeeting { title: string; daysFromToday: number; startTime: string; location: string; status: string; items: MockItem[] }

const mock = (file: string) => JSON.parse(readFileSync(join(root, 'mock-data', file), 'utf8'));
const isoDate = (daysFromToday: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const pilots = mock('check-pilots.json') as { name: string }[];
const meetings = mock('meetings.json') as MockMeeting[];

db.transaction(() => {
  for (const t of ['agenda_items', 'meetings', 'check_pilots']) db.prepare(`DELETE FROM ${t}`).run();

  const pilotIds = new Map<string, number>();
  for (const p of pilots) {
    pilotIds.set(p.name, Number(db.prepare('INSERT INTO check_pilots (name) VALUES (?)').run(p.name).lastInsertRowid));
  }

  for (const m of meetings) {
    const meetingId = Number(db.prepare('INSERT INTO meetings (title, meeting_date, start_time, location, status) VALUES (?, ?, ?, ?, ?)')
      .run(m.title, isoDate(m.daysFromToday), m.startTime, m.location, m.status).lastInsertRowid);
    m.items.forEach((item, i) => {
      db.prepare('INSERT INTO agenda_items (meeting_id, position, title, presenter_id, minutes, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(meetingId, i + 1, item.title, item.presenter ? pilotIds.get(item.presenter) ?? null : null, item.minutes, item.notes, item.status);
    });
  }
})();

console.log(`Seeded ${pilots.length} check pilots, ${meetings.length} meetings into ${dbPath}`);
