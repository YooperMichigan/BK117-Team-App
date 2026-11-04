# BK117 Team App: Power Apps status (Nov 4, 2026)

The live app is **BK117 Team App**, a Power Apps canvas app in the Air Methods tenant
(environment airmethods.com (default)), added to Teams as a personal app. It is built and
edited by hand in Power Apps Studio on Chad's Mac; the YAML files in this folder are the
paste-in source and are kept in step with the live app as closely as possible.

## Data (SharePoint site BK117CAGroup)

Site: https://airmethods0.sharepoint.com/sites/BK117CAGroup

| List / library | Name in formulas | Columns used |
| --- | --- | --- |
| Check Pilots | `'Check Pilots'` (has a space) | Title (name), ListOrder (number) |
| Meetings | `Meetings` | Title, MeetingDate (date only), StartTime (text HH:MM), EndTime (text HH:MM), Location, Status (`Upcoming` / `Held`, shown as "Completed") |
| AgendaItems | `AgendaItems` | Title, MeetingID (number), Position, Presenter (text), Minutes, Notes, Status (`Open` / `Discussed` / `Carried`), CarriedFrom (date) |
| Intentions | `Intentions` | Title (the statement), Pilot (text), TargetDate (date), Status (`Open` / `Done`) |
| Documents | `Documents` | Team Files page reads folder `Shared Documents/BK117 CA Files/` |

App setting: **Data row limit = 2000** (the Documents library has 500+ items).
Check airmen should be site **Members**; keep two Owners.

## Screens and sidebar

Sidebar order on every screen: **Home (Y 120), Team Files (170), Meetings (220), I intend to... (270)**.
Nav buttons are named `nav<Page>_<Screen>` (see `13-SidebarNav-AllScreens.yaml`).
Sidebar: kicker "AIR METHODS-TRAINING DEPARTMENT" at X 23 Y 15, brand at X 23 Y 50, buttons X 18.

| Screen | What it does | Source file |
| --- | --- | --- |
| HomeScreen | App start screen; helicopter sketch (`imgHome`) | `5-HomeScreen.yaml` |
| FilesScreen | Lists BK117 CA Files (folders first, A-Z), search reaches subfolders, Open / Open folder | `11-FilesScreen.yaml` |
| MeetingsScreen | Meeting card, agenda with clock times, add item, meeting list with Actions (Edit, Mark complete, Reopen, Delete) | `2-MeetingsScreen.yaml`, `6-MeetingList-Actions.yaml` |
| NewMeetingScreen | New / edit meeting (start 11:00, end follows start +60) | `3-NewMeetingScreen.yaml`, `4-NewMeetingScreen-OnVisible.txt` |
| IntendScreen | "I intend to..." list with Mark done / Delete and Add an intention | `8-IntendScreen.yaml`, `9-IntendContent.yaml` |

App.OnStart: `1-App-OnStart.txt` (sets varMeeting, varArmed, varEditMeeting).

## Look

- Navy (Air Methods header colour) `RGBA(14, 34, 64, 1)` #0E2240; selected nav `RGBA(31, 58, 99, 1)`
- Orange buttons `RGBA(232, 105, 31, 1)`; kicker text `RGBA(240, 160, 112, 1)`; page `RGBA(243, 242, 239, 1)`
- Empty-state blueprint pictures in `backgrounds/` (agenda, add item, meeting list, intentions);
  icons in `icon/` (Teams colour + outline, app icons)

## Lessons learned (read before giving the next set of steps)

1. Give **complete** formulas and complete YAML blocks to paste; partial edits ("change this line") cause mistakes.
2. New blank screens come with **ScreenContainer1**: delete it, it hides pasted controls.
3. Mac smart quotes break formulas (U+201C errors); prefer `Blank()` over `""` where possible.
4. Single-control pastes sometimes fail; multi-control pastes work. Fallback: copy an existing control and edit.
5. Tree view order = stacking order (top is in front). Hint labels must be brought in front of pictures.
6. `IsFolder` does not work on this library; detect files by known extensions instead.
7. `'Folder path'` equality and `IsEmpty(list)` were unreliable; `EndsWith('Folder path', ...)` and
   `CountRows(<gallery>.AllItems)` work.
8. Teams caches the app name and icon: remove and re-add the app from Power Apps "Add to Teams".
9. F5 does nothing on the Mac: use the play button (or Option-click to test on the canvas).
10. Claude cannot see or edit the app directly; changes go through Chad pasting into Studio.

## Ideas not yet built

- Blueprint picture for an empty Team Files list
- "Changed in the last 30 days" marker on Team Files
- Action items list from meetings
- Grey outline icon in the Teams rail (needs "Upload a custom app" or IT)
