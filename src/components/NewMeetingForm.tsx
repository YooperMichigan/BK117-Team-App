import { useState } from 'react';
import type { Meeting } from '../../shared/types.ts';
import { api } from '../api';

export function NewMeetingForm({ onCreated, onCancel }: { onCreated: (id: number) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('BK117 check pilot meeting');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const m = await api.post<Meeting>('/api/meetings', { title, date, startTime, location });
      onCreated(m.id);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>New meeting</h2>
      <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} /></label>
      <div className="row">
        <label>Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></label>
        <label>Start time<input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required /></label>
      </div>
      <label>Location or call link<input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={200} /></label>
      {error && <p className="error">{error}</p>}
      <div className="row">
        <button className="button primary" type="submit">Create meeting</button>
        <button className="button" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
