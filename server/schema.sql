-- BK117 Check Pilot Team app. All rows in the POC come from mock-data/ (sample content).

CREATE TABLE IF NOT EXISTS check_pilots (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meetings (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  meeting_date TEXT NOT NULL,           -- ISO date, YYYY-MM-DD
  start_time TEXT NOT NULL,             -- 24h HH:MM
  location TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'held'))
);

CREATE TABLE IF NOT EXISTS agenda_items (
  id INTEGER PRIMARY KEY,
  meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  title TEXT NOT NULL,
  presenter_id INTEGER REFERENCES check_pilots(id) ON DELETE SET NULL,
  minutes INTEGER NOT NULL DEFAULT 10 CHECK (minutes > 0),
  notes TEXT NOT NULL DEFAULT '',
  -- 'carried' means the item was not reached and was copied forward to a later meeting.
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'discussed', 'carried')),
  carried_from_id INTEGER REFERENCES agenda_items(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS agenda_items_meeting ON agenda_items (meeting_id, position);
