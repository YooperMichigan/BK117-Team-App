# BK117 Check Pilots: Power Apps version

A Power Apps canvas app version of the meeting agenda, so it can run inside Teams on
Air Methods' own Microsoft 365 without an IT ticket. Data lives in three SharePoint lists.

| File | What it is | Where it goes |
| --- | --- | --- |
| `1-App-OnStart.txt` | Picks the meeting to show when the app opens | App → OnStart |
| `2-MeetingsScreen.yaml` | The Meetings screen: sidebar, meeting card, agenda, add item, meeting list | Paste into `MeetingsScreen` |
| `3-NewMeetingScreen.yaml` | The New meeting form | Paste into `NewMeetingScreen` |

Step-by-step instructions, including the SharePoint list columns, are in the build guide doc.

The YAML uses Power Apps' paste-code format (classic controls). It was written without access
to Power Apps, so a control type or property name may need a small fix the first time; the
paste error names the line.
