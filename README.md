# Jira Ticket Organizer

A local drag-and-drop board for organizing Jira tickets across EISGRC columns.
No Jira login. No internet required. Board state saves locally and can be shared as a JSON file.

Screenshot removed (Ill add another one later this week)

---

## Download

**Option A — Download ZIP** (no Git required)

1. Click the green **Code** button at the top of this page
2. Select **Download ZIP**
3. Extract the ZIP to any folder on your computer

**Option B — Clone with Git**

```bash
git clone https://github.com/autisticcaveman/jira-ticket-organizer.git
cd jira-ticket-organizer
```

---

## Installation

### macOS

Open **Terminal** and navigate to the extracted folder:

```bash
cd path/to/jira-ticket-organizer
chmod +x install-mac.sh && ./install-mac.sh
```

The installer checks for Node.js and installs it via Homebrew if missing.
If Homebrew is also absent, it will prompt you to install Node.js manually from https://nodejs.org (LTS `.pkg` installer).

**Launch the app:**
- Double-click **`start-mac.command`** in Finder

  > First launch only: right-click → **Open** → **Open** to allow the file past macOS Gatekeeper.

- Browser opens automatically at **http://localhost:3000**
- Close the Terminal window to stop the server

---

### Windows 11

Open the extracted folder and **double-click `install-windows.bat`**.

The installer checks for Node.js and installs it via winget if missing.
If winget is unavailable, it will prompt you to install Node.js manually from https://nodejs.org (LTS Windows `.msi` installer).

> If Node.js installs but npm fails immediately after, close the window and run `install-windows.bat` again — Windows sometimes needs a fresh session to pick up the new PATH.

**Launch the app:**
- Double-click **`start-windows.bat`**
- Browser opens automatically at **http://localhost:3000**
- Close the terminal window to stop the server

---

## Running (after installation)

| Platform   | Command / Action              |
|------------|-------------------------------|
| macOS      | Double-click `start-mac.command` |
| Windows 11 | Double-click `start-windows.bat` |
| Any (CLI)  | `npm start` in the project folder |

App runs at **http://localhost:3000**. Nothing is sent to the internet.

---

## Features

- **EISGRC columns** (purple headers) — each column is one EISGRC epic; add/remove freely
- **Stories** (green) and **Tasks** (blue) — color-coded tickets with type badges
- **EISGRC- prefix enforced** — enter just the number, prefix is fixed
- **Drag and drop** — reorder within a column or move tickets between columns
- **Double-click** any column header, story, or task to inline edit ID, label, and priority
- **Hover** to reveal × delete on tickets and column headers, with inline Yes/No confirmation
- **Priority badges** — P1 (Critical/red), P2 (High/orange), P3 (Medium/yellow), P4 (Low/gray)
- **Moved flag** — tickets dragged cross-column show a teal "↗ moved" badge; click to acknowledge
- **Board persists** across sessions via localStorage — restored on every open
- **💾 Save** — export board as a dated `.json` file for sharing or backup
- **📂 Open** — import a `.json` board file from another user
- **⚙ Settings** — Light / Dark / System theme toggle; daily app log viewer (7-day rotation)
- **Duplicate detection** — rejects ticket IDs that already exist on the board

---

## Stack

- **React 19** (Create React App)
- **`@dnd-kit/core` + `@dnd-kit/sortable`** — drag and drop
  *(react-beautiful-dnd was dropped — incompatible with React 19)*
- No backend. No database. No external services.

---

## File Structure

```
jira-ticket-organizer/
├── install-mac.sh          macOS installer (Node.js check + npm install)
├── start-mac.command       macOS launcher (double-clickable)
├── install-windows.bat     Windows installer entry point (double-clickable)
├── install-windows.ps1     Windows install logic (winget → Node.js + npm install)
├── start-windows.bat       Windows launcher (double-clickable)
├── USER_MANUAL.md          Full user manual
├── docs/
│   └── jira_organizer.png  App screenshot
└── src/
    ├── App.js              Board state, DnD context, all handlers, persistence, file I/O
    ├── Column.js           Droppable column with inline rename + delete confirm
    ├── SortableJiraTicket.js  Drag wrapper with inline edit and confirm-delete state
    ├── JiraTicket.js       Visual ticket component (shared with DragOverlay)
    ├── Settings.js         Settings modal — theme picker + log viewer
    ├── storage.js          localStorage helpers: board, settings, daily log rotation
    └── App.css             CSS variable theming (dark/light/system), all component styles
```

---

## Notes

- **No data leaves your machine.** The app has no telemetry, no analytics, no accounts.
  The only external fetch is loading Bootstrap/Chart.js from a CDN — no activity data is involved.
- **localStorage** is used for auto-save. Clearing browser data will reset the board.
  Use **💾 Save** to keep a portable backup.
- **Sharing workflow:** export your board → recipient opens it with **📂 Open** →
  they reorganize and export back → you import and see **↗ moved** badges on relocated tickets.

For full usage instructions see **[USER_MANUAL.md](USER_MANUAL.md)**.
