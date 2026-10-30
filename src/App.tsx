import { useCallback, useEffect, useState } from 'react';
import type { CheckPilot, MeetingSummary } from '../shared/types.ts';
import { api } from './api';
import { MeetingList } from './components/MeetingList';
import { MeetingAgenda } from './components/MeetingAgenda';
import { NewMeetingForm } from './components/NewMeetingForm';

export default function App() {
  const [meetings, setMeetings] = useState<MeetingSummary[] | null>(null);
  const [pilots, setPilots] = useState<CheckPilot[]>([]);
  const [selected, setSelected] = useState<number | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMeetings = useCallback(() => api.get<MeetingSummary[]>('/api/meetings').then(setMeetings, (e: Error) => setError(e.message)), []);

  useEffect(() => {
    loadMeetings();
    api.get<CheckPilot[]>('/api/check-pilots').then(setPilots, (e: Error) => setError(e.message));
  }, [loadMeetings]);

  // Default to the next upcoming meeting.
  const current = selected ?? meetings?.[0]?.id ?? null;

  return (
    <div className="app">
      <div className="sample-banner">Proof of concept. All content is sample data, not Air Methods records.</div>
      <header className="header">
        <h1>BK117 Check Pilots</h1>
        <span className="muted">Team meeting agenda</span>
      </header>
      {error ? (
        <p className="content error">Unavailable: {error}. Is the server running and seeded?</p>
      ) : !meetings ? (
        <p className="content muted">Loading…</p>
      ) : (
        <div className="layout">
          <MeetingList meetings={meetings} selected={current} onSelect={setSelected} />
          <main className="content">
            {current === 'new' ? (
              <NewMeetingForm
                onCancel={() => setSelected(null)}
                onCreated={(id) => {
                  loadMeetings();
                  setSelected(id);
                }}
              />
            ) : current !== null ? (
              <MeetingAgenda key={current} meetingId={current} pilots={pilots} onChanged={loadMeetings} onOpenMeeting={setSelected} />
            ) : (
              <p className="muted">No meetings yet. Create one to start an agenda.</p>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
