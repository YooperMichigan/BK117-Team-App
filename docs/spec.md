# BK117 Check Pilot Team App

## Premise

A tablet-first web app for the BK117 Check Pilots in the Air Methods Training Department.
It gives the team one shared place to run its work. It starts small, with the team meeting
agenda, and grows one feature at a time.

## Feature 1: Meeting Agenda (current)

The BK117 check pilot team holds regular meetings. The app keeps the agenda for each one.

- **Meetings list:** upcoming meetings first, then past meetings. Create a new meeting with a
  title, date, start time and location (or call link).
- **Agenda:** an ordered list of items. Each item has a title, a presenter (a check pilot),
  a time allotment in minutes, and notes. The app shows the planned clock time for each item
  and the total meeting length.
- **During the meeting:** mark items discussed and take notes on each one.
- **Carry over:** items not reached roll forward to the next upcoming meeting, keeping a link
  back to where they came from.
- **Close out:** mark the meeting held. A held meeting stays readable as the record of what was
  discussed.

## Later features (not yet scoped)

To be chosen by the team. Candidates raised so far:
- Action items with owners and due dates, tracked across meetings
- Checkride gradesheets for BK117 evaluations
- Pilot tracker (what's due, completed events)
- Standardization library (maneuver guides, check pilot bulletins) with revision tracking
- Check pilot availability and team announcements

## Build Notes

- **Stack:** SQLite backend plus a simple web front end, the same pattern as the Pilot Indoc app
- **Data:** proof of concept on invented sample data only
- **Sign-in:** none in the POC; every user is treated as a BK117 check pilot
