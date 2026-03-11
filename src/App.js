import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Column } from './Column';
import { JiraTicket } from './JiraTicket';
import { saveBoard, loadBoard, saveSettings, loadSettings, appendLog } from './storage';
import { Settings } from './Settings';
import './App.css';

const generateColumns = () => {
  const cols = {};
  for (let i = 1; i <= 10; i++) {
    cols[`col-${i}`] = {
      id: `col-${i}`,
      headerId: `EISGRC-${i}`,
      name: `Column ${i}`,
      tickets: [],
    };
  }
  cols['col-1'].name = 'Auth Platform';
  cols['col-1'].tickets = [
    { id: 'EISGRC-11', type: 'story', label: 'Login Page' },
    { id: 'EISGRC-12', type: 'task',  label: 'Setup OAuth' },
  ];
  cols['col-2'].name = 'Reporting';
  cols['col-2'].tickets = [
    { id: 'EISGRC-21', type: 'story', label: 'Dashboard View' },
  ];
  return cols;
};

// Monotonically increasing key so new columns always get a unique id
let colCounter = 11;

function findColumnOfTicket(columns, ticketId) {
  for (const colId in columns) {
    if (columns[colId].tickets.some(t => t.id === ticketId)) {
      return colId;
    }
  }
  return null;
}

function App() {
  const [columns, setColumns]           = useState(() => loadBoard() || generateColumns());
  const [activeTicket, setActiveTicket] = useState(null);
  const [newColId, setNewColId]         = useState(null); // which col should auto-open in edit mode
  const [settings, setSettings]         = useState(() => loadSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [ticketNumber, setTicketNumber]     = useState('');
  const [ticketLabel, setTicketLabel]       = useState('');
  const [ticketType, setTicketType]         = useState('story');
  const [ticketPriority, setTicketPriority] = useState('');
  const [targetCol, setTargetCol]           = useState('col-1');

  const fileInputRef    = useRef(null);
  const dragSourceColRef = useRef(null); // tracks origin column during drag; ref avoids stale closure

  // Theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', settings.theme);
    saveSettings(settings);
  }, [settings]);

  // Board persistence effect
  useEffect(() => { saveBoard(columns); }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart({ active }) {
    const colId = findColumnOfTicket(columns, active.id);
    if (colId) {
      setActiveTicket(columns[colId].tickets.find(t => t.id === active.id));
      dragSourceColRef.current = colId; // record where the drag started
    }
  }

  function handleDragOver({ active, over }) {
    if (!over) return;
    const activeColId = findColumnOfTicket(columns, active.id);
    const overColId   = columns[over.id]
      ? over.id
      : findColumnOfTicket(columns, over.id);

    if (!activeColId || !overColId || activeColId === overColId) return;

    setColumns(prev => {
      const activeTickets = [...prev[activeColId].tickets];
      const overTickets   = [...prev[overColId].tickets];
      const activeIdx     = activeTickets.findIndex(t => t.id === active.id);
      const [moved]       = activeTickets.splice(activeIdx, 1);
      let overIdx         = overTickets.findIndex(t => t.id === over.id);
      if (overIdx === -1) overIdx = overTickets.length;
      overTickets.splice(overIdx, 0, moved);
      return {
        ...prev,
        [activeColId]: { ...prev[activeColId], tickets: activeTickets },
        [overColId]:   { ...prev[overColId],   tickets: overTickets },
      };
    });
  }

  function handleDragEnd({ active, over }) {
    setActiveTicket(null);
    const srcColId = dragSourceColRef.current;
    dragSourceColRef.current = null;

    if (!over) return;
    const activeColId = findColumnOfTicket(columns, active.id);
    const overColId   = findColumnOfTicket(columns, over.id) || over.id;
    if (activeColId !== overColId) return;

    const movedCrossColumn = srcColId && srcColId !== activeColId;

    setColumns(prev => {
      const tickets  = [...prev[activeColId].tickets];
      const oldIndex = tickets.findIndex(t => t.id === active.id);
      const newIndex = tickets.findIndex(t => t.id === over.id);

      let result = tickets;
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        result = arrayMove(tickets, oldIndex, newIndex);
      }

      if (movedCrossColumn) {
        if (result === tickets) result = [...tickets]; // ensure we have a copy
        const idx = result.findIndex(t => t.id === active.id);
        if (idx !== -1) result[idx] = { ...result[idx], moved: true };
      }

      if (result === tickets) return prev;
      return { ...prev, [activeColId]: { ...prev[activeColId], tickets: result } };
    });
  }

  function handleAdd() {
    const num = ticketNumber.trim();
    if (!num) return;
    const id = `EISGRC-${num}`;

    for (const colId in columns) {
      if (columns[colId].tickets.some(t => t.id === id)) {
        alert(`${id} already exists.`);
        return;
      }
    }

    setColumns(prev => ({
      ...prev,
      [targetCol]: {
        ...prev[targetCol],
        tickets: [
          ...prev[targetCol].tickets,
          { id, type: ticketType, label: ticketLabel.trim() || id, priority: ticketPriority },
        ],
      },
    }));
    setTicketNumber('');
    setTicketLabel('');
    const priorityNote = ticketPriority ? ` [${ticketPriority.toUpperCase()}]` : '';
    appendLog('ticket_added', `${id} (${ticketType})${priorityNote} → ${columns[targetCol]?.name || targetCol}`);
  }

  function handleAddColumn() {
    const id = `col-${colCounter++}`;
    const newCol = {
      id,
      headerId: 'EISGRC-?',
      name: 'New Column',
      tickets: [],
    };
    setColumns(prev => ({ ...prev, [id]: newCol }));
    setNewColId(id); // tell that column to open in edit mode immediately
    appendLog('column_added', newCol.id);
  }

  function handleDeleteColumn(colId) {
    appendLog('column_deleted', `${columns[colId]?.headerId} "${columns[colId]?.name}" (${columns[colId]?.tickets.length} tickets)`);
    setColumns(prev => {
      const next = { ...prev };
      delete next[colId];
      return next;
    });
    // If the deleted column was the target for new tickets, reset to first available
    if (targetCol === colId) {
      setTargetCol(Object.keys(columns).find(id => id !== colId) || '');
    }
  }

  function handleRename(colId, newHeaderId, newName) {
    setColumns(prev => ({
      ...prev,
      [colId]: { ...prev[colId], headerId: newHeaderId, name: newName },
    }));
    if (newColId === colId) setNewColId(null);
    appendLog('column_renamed', `${newHeaderId} "${newName}"`);
  }

  function handleEditTicket(oldId, newId, newLabel, newPriority) {
    if (oldId !== newId) {
      for (const colId in columns) {
        if (columns[colId].tickets.some(t => t.id === newId)) {
          alert(`${newId} already exists.`);
          return;
        }
      }
    }
    setColumns(prev => {
      const next = { ...prev };
      for (const colId in next) {
        const idx = next[colId].tickets.findIndex(t => t.id === oldId);
        if (idx !== -1) {
          const tickets = [...next[colId].tickets];
          tickets[idx] = { ...tickets[idx], id: newId, label: newLabel, priority: newPriority || '' };
          next[colId] = { ...next[colId], tickets };
          break;
        }
      }
      return next;
    });
    const priorityNote = newPriority ? ` [${newPriority.toUpperCase()}]` : '';
    appendLog('ticket_edited', `${oldId} → ${newId}${priorityNote}`);
  }

  function handleDeleteTicket(ticketId) {
    appendLog('ticket_deleted', ticketId);
    setColumns(prev => {
      const next = { ...prev };
      for (const colId in next) {
        if (next[colId].tickets.some(t => t.id === ticketId)) {
          next[colId] = {
            ...next[colId],
            tickets: next[colId].tickets.filter(t => t.id !== ticketId),
          };
          break;
        }
      }
      return next;
    });
  }

  function handleAcknowledgeMove(ticketId) {
    setColumns(prev => {
      const next = { ...prev };
      for (const colId in next) {
        const idx = next[colId].tickets.findIndex(t => t.id === ticketId);
        if (idx !== -1) {
          const tickets = [...next[colId].tickets];
          const { moved, ...rest } = tickets[idx]; // eslint-disable-line no-unused-vars
          tickets[idx] = rest;
          next[colId] = { ...next[colId], tickets };
          break;
        }
      }
      return next;
    });
    appendLog('move_acknowledged', ticketId);
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        // basic validation: must be an object with at least one column that has id, headerId, name, tickets
        const cols = Object.values(data);
        if (!cols.length || !cols[0].id || !Array.isArray(cols[0].tickets)) throw new Error();
        setColumns(data);
        appendLog('file_imported', file.name);
      } catch {
        alert('Invalid board file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleExport() {
    const date = new Date().toISOString().slice(0, 10);
    const filename = `jira-board-${date}.json`;
    const blob = new Blob([JSON.stringify(columns, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    appendLog('file_exported', filename);
  }

  return (
    <div className="App">
      <div className="app-header">
        <h1>Jira Ticket Organizer</h1>
        <button className="settings-btn" onClick={() => setSettingsOpen(true)}>⚙ Settings</button>
      </div>

      <div className="add-ticket">
        <span className="ticket-prefix">EISGRC-</span>
        <input
          className="input-number"
          type="number"
          min="1"
          placeholder="###"
          value={ticketNumber}
          onChange={e => setTicketNumber(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <input
          className="input-label"
          type="text"
          placeholder="Label (optional)"
          value={ticketLabel}
          onChange={e => setTicketLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <select value={ticketType} onChange={e => setTicketType(e.target.value)}>
          <option value="story">Story</option>
          <option value="task">Task</option>
        </select>
        <select value={ticketPriority} onChange={e => setTicketPriority(e.target.value)}>
          <option value="">Priority</option>
          <option value="p1">P1 — Critical</option>
          <option value="p2">P2 — High</option>
          <option value="p3">P3 — Medium</option>
          <option value="p4">P4 — Low</option>
        </select>
        <select value={targetCol} onChange={e => setTargetCol(e.target.value)}>
          {Object.values(columns).map(col => (
            <option key={col.id} value={col.id}>{col.headerId} — {col.name}</option>
          ))}
        </select>
        <button onClick={handleAdd}>Add</button>
        <div className="toolbar-divider" />
        <button className="toolbar-btn" onClick={() => fileInputRef.current.click()}>📂 Open</button>
        <button className="toolbar-btn" onClick={handleExport}>💾 Save</button>
        <input ref={fileInputRef} type="file" accept=".json" style={{display:'none'}} onChange={handleImport} />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="board">
          {Object.values(columns).map(col => (
            <Column
              key={col.id}
              column={col}
              autoEdit={col.id === newColId}
              onRename={handleRename}
              onDeleteColumn={handleDeleteColumn}
              onEditTicket={handleEditTicket}
              onDeleteTicket={handleDeleteTicket}
              onAcknowledgeMove={handleAcknowledgeMove}
            />
          ))}
          <button className="add-column-btn" onClick={handleAddColumn}>
            + Add Column
          </button>
        </div>
        <DragOverlay>
          {activeTicket ? <JiraTicket ticket={activeTicket} /> : null}
        </DragOverlay>
      </DndContext>

      {settingsOpen && (
        <Settings
          settings={settings}
          onChangeSettings={s => setSettings(s)}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
