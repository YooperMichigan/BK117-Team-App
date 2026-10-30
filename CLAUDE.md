# CLAUDE.md: BK117 Check Pilot Team App (proof of concept)

## Project summary
A tablet-first web app for the BK117 Check Pilots in the Air Methods Training Department.
It starts small: the **team meeting agenda**. Further features are added one at a time, only
when the team asks for them. This repo is a **proof of concept**: every check pilot, meeting
and agenda item is invented sample content in `mock-data/`.

Full product spec: `docs/spec.md`.

## Tech stack
Same pattern as the Pilot Indoc app.
- **Frontend:** Vite + React + TypeScript, tablet-first (44px touch targets, safe-area insets)
- **Backend:** Node + Express (`server/`), port 3003 (Indoc uses 3002, so both can run at once)
- **Storage:** SQLite via better-sqlite3 (`data/bk117.db`, gitignored)

## Hard rules
1. **No real Air Methods content in this repo.** No real pilot names, meeting minutes, gradesheets,
   RFM, GOM or training records. Sample content must be obviously fake and labeled "sample".
2. The UI always shows the "sample data" banner while the app runs on mock data.
3. Ask before adding any dependency not already in `package.json`.
4. Don't add features outside the current one. Finish and verify each feature first.

## Layout
```
docs/spec.md               product spec
mock-data/                 invented sample content (seeded into SQLite)
server/index.ts            Express API
server/schema.sql          SQLite schema
server/db.ts               database connection + schema
scripts/seed.ts            rebuilds the database from mock-data/
shared/types.ts            types shared by server and UI
src/App.tsx                shell: banner, header, meeting list + agenda
src/components/            UI components
```

## Build order (stop and confirm after each)
1. **Meeting agenda** (done): meetings, agenda items with presenter/time/notes, discussed status,
   carry-over to the next meeting, mark held.
2. Next feature: to be chosen by the team (see `docs/spec.md`).

## Definition of done for each feature
- `npm run dev` starts the app with no console errors
- `npm run typecheck` passes
- Works at iPad sizes in portrait and landscape
- Brief note on what was built and how to demo it

## Commands
- Install: `npm install`
- Seed sample data: `npm run seed`
- Dev: `npm run dev` (Vite on 5173 and the API on 3003 together)
- Server only: `npm run server`
- Typecheck: `npm run typecheck`

## Flag, don't decide silently
- Anything that would put real Air Methods content or personal data in the repo
- Scope creep beyond the current feature (sign-in, deployment, integrations)
