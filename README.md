# BK117 Check Pilot Team (proof of concept)

A tablet-first web app for the BK117 Check Pilots in the Air Methods Training Department.
The first feature is the team **meeting agenda**.

**This is a demo.** All content is invented sample data (`mock-data/`).

See `docs/spec.md` for the product spec and `CLAUDE.md` for build rules.

## Run it

```bash
npm install
npm run seed
npm run dev
```

Open http://localhost:5173.

To demo on an iPad on the same Wi-Fi, run the two halves separately so Vite listens on the network:

```bash
npm run server
```

```bash
npx vite --host
```

Then open the "Network" address Vite prints on the iPad.

Requires Node 22.18 or newer (the server runs TypeScript directly).

## Demo: meeting agenda

1. Pick a meeting from the list (upcoming meetings first). The agenda shows each item's planned
   clock time, presenter and allotment, plus the meeting's total length.
2. Add an item at the bottom of the agenda. Reorder with the arrows, edit notes in place.
3. During the meeting, tap **Mark discussed** on each item.
4. Tap **Carry open items to next meeting**: anything not reached moves to the next upcoming
   meeting, labeled with where it came from.
5. Tap **Mark held** to close out the meeting. It moves to Past and becomes read-only.

`npm run seed` resets everything to the sample data.
