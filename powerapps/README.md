# BK117 Check Pilots: Power Apps version

A Power Apps canvas app version of the meeting agenda, so it can run inside Teams on
Air Methods' own Microsoft 365 without an IT ticket. Data lives in three SharePoint lists.

| File | What it is | Where it goes |
| --- | --- | --- |
| `1-App-OnStart.txt` | Picks the meeting to show when the app opens | App → OnStart |
| `2-MeetingsScreen.yaml` | The Meetings screen: sidebar, meeting card, agenda, add item, meeting list | Paste into `MeetingsScreen` |
| `3-NewMeetingScreen.yaml` | The New / Edit meeting form | Paste into `NewMeetingScreen` |
| `4-NewMeetingScreen-OnVisible.txt` | Clears the form each time it opens | NewMeetingScreen → OnVisible |
| `5-HomeScreen.yaml` | Home screen: sidebar plus the helicopter drawing; the app opens here | Paste into `HomeScreen` |
| `6-MeetingList-Actions.yaml` | Meeting list with an Actions drop-down: Mark complete, Reopen, Delete meeting | Replaces lblMeetings + galMeetings on `MeetingsScreen` |

Step-by-step instructions, including the SharePoint list columns, are in the build guide doc.

The YAML uses Power Apps' paste-code format (classic controls). It was written without access
to Power Apps, so a control type or property name may need a small fix the first time; the
paste error names the line.

## Status: working (Oct 31, 2026)

Running in the Air Methods tenant and added to Teams. Fixes found during the trial, now in these files:
- Delete the default ScreenContainer1 a new screen comes with; it is white and hides the pasted controls.
- Times are computed from the HH:MM start time in minutes (string date parsing failed with no meeting).
- OnStart uses `Blank()`; Mac smart quotes turned `""` into curly quotes.
- Presenter drop-down: `ShowColumns(Sort(CheckPilots, ListOrder, SortOrder.Ascending), Title)`.
  If the SharePoint list was named with a space, refer to it as `'Check Pilots'`.
- Add item wraps the Patch in `IfError` so any save error is shown on screen.

The Meetings list also needs an `EndTime` column (Single line of text, HH:MM), added Oct 31, 2026.
