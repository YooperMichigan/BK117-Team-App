import { useState } from 'react';
import type { CheckPilot, NewAgendaItem } from '../../shared/types.ts';

export function AddItemForm({ pilots, onAdd }: { pilots: CheckPilot[]; onAdd: (item: NewAgendaItem) => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [presenterId, setPresenterId] = useState('');
  const [minutes, setMinutes] = useState(10);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await onAdd({ title, presenterId: presenterId ? Number(presenterId) : null, minutes });
    setTitle('');
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h3>Add agenda item</h3>
      <label>Topic<input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} /></label>
      <div className="row">
        <label>Presenter
          <select value={presenterId} onChange={(e) => setPresenterId(e.target.value)}>
            <option value="">None</option>
            {pilots.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label>Minutes<input type="number" min={1} max={240} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} required /></label>
      </div>
      <div className="row"><button className="button primary" type="submit">Add item</button></div>
    </form>
  );
}
