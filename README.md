# Jira Ticket Organizer

A local React drag-and-drop board for organizing Jira tickets across EISGRC columns.
No Jira login. No internet required. Board state saves locally and can be shared as a JSON file.

---

## Installation

### macOS

1. Download or clone this repository
2. Open Terminal, navigate to the folder, and run:
   ```bash
   chmod +x install-mac.sh && ./install-mac.sh
   ```
   The script checks for Node.js (installs via Homebrew if missing) and installs dependencies.

3. Launch the app:
   - **Double-click** `start-mac.command` in Finder
   - Or run `./start-mac.command` in Terminal

   The app opens at **http://localhost:3000** automatically.

> **First time only:** macOS may block `start-mac.command` with a security warning.
> Right-click the file → **Open** → **Open** to allow it. This only needs to happen once.

---

### Windows 11

1. Download or clone this repository
2. Double-click **`install-windows.bat`**
   - Installs Node.js automatically via winget if not present
   - Installs app dependencies

3. Launch the app:
   - Double-click **`start-windows.bat`**

   The app opens at **http://localhost:3000** automatically.

> **If Node.js installs but npm fails immediately after:** Close the window and run
> `install-windows.bat` again — Windows sometimes needs a fresh session to update PATH.

---

## Usage

### Board

- Each **column** (purple header) = one EISGRC item
- Tickets are **Stories** (green) or **Tasks** (blue)
- Ticket IDs use the `EISGRC-` prefix — enter just the number

### Adding Tickets

Fill in the number, optional label, type, optional priority, and target column, then click **Add** or press **Enter**.

### Editing

- **Double-click** any column header, story, or task to edit its ID, label, and priority inline
- **Hover** a ticket or column header to reveal the **×** delete button
- Deleting requires a **Yes/No** confirmation (column delete shows how many tickets will be lost)

### Drag and Drop

- Drag tickets within a column to reorder
- Drag tickets between columns to reassign
- Tickets moved to a different column show a **↗ moved** badge until acknowledged

### Priority Badges

| Badge | Meaning  |
|-------|----------|
| P1    | Critical |
| P2    | High     |
| P3    | Medium   |
| P4    | Low      |

Set on the add form or via double-click edit. Displayed as a colored badge on the ticket.

### Columns

- **Add Column** button at the right end of the board
- New columns open in edit mode immediately — set the EISGRC ID and name
- Hover a column header to reveal the **×** delete button

### Saving and Sharing

- **💾 Save** — exports the current board as a dated `.json` file
- **📂 Open** — imports a `.json` board file
- Board state is also saved automatically in the browser's localStorage

The JSON file contains the full board state including ticket IDs, labels, types, priorities,
and moved flags. Share the file, the recipient opens it with **📂 Open**.

### Settings (⚙)

- **Display** — Light / Dark / System theme
- **App Logs** — view a daily log of all board activity; rotates after 7 days

---

## Stack

- React 19 (Create React App)
- `@dnd-kit/core` + `@dnd-kit/sortable`

## File Structure

```
install-mac.sh          macOS installer
start-mac.command       macOS launcher (double-clickable)
install-windows.bat     Windows installer (double-clickable)
install-windows.ps1     Windows install logic (called by .bat)
start-windows.bat       Windows launcher (double-clickable)

src/
  App.js                board state, DnD context, all handlers, persistence, file I/O
  Column.js             droppable column with inline rename + delete confirm
  SortableJiraTicket.js drag wrapper with edit/confirm-delete state
  JiraTicket.js         visual ticket component (also used by DragOverlay)
  Settings.js           settings modal (theme + log viewer)
  storage.js            localStorage helpers: board, settings, daily log rotation
  App.css               CSS variable theming (dark/light/system), all component styles
```

## Requirements

- Node.js 18+ (installed automatically by the install scripts)
- A modern browser (Chrome, Firefox, Edge, Safari)
