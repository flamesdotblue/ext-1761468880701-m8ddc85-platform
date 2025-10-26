import React, { useMemo, useState } from 'react';
import { Database, Table as TableIcon, Plus, Settings } from 'lucide-react';

export default function DatabaseExplorer({ databases, activeDbId, activeTableId, onSelectDb, onSelectTable, onAddDatabase, onAddTable }) {
  const [expanded, setExpanded] = useState({});
  const [newDbName, setNewDbName] = useState('');
  const [newTableName, setNewTableName] = useState('');

  const dbEntries = useMemo(() => Object.values(databases), [databases]);

  function toggle(dbId) {
    setExpanded((e) => ({ ...e, [dbId]: !e[dbId] }));
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Databases</div>
          <Settings className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={newDbName}
            onChange={(e) => setNewDbName(e.target.value)}
            placeholder="New database"
            className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            onClick={() => {
              if (!newDbName.trim()) return;
              onAddDatabase(newDbName.trim());
              setNewDbName('');
            }}
            className="inline-flex items-center justify-center rounded-md bg-sky-600 text-white px-2 py-1 text-sm hover:bg-sky-700"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {dbEntries.map((db) => (
          <div key={db.id} className={`mb-2 rounded-md border ${activeDbId === db.id ? 'border-sky-500' : 'border-slate-200 dark:border-slate-800'} bg-white/70 dark:bg-slate-950/60`}>
            <div
              className={`flex items-center justify-between px-2 py-2 cursor-pointer select-none ${activeDbId === db.id ? 'bg-sky-50 dark:bg-sky-950/30' : ''}`}
              onClick={() => {
                onSelectDb(db.id);
                toggle(db.id);
              }}
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center" style={{ borderColor: db.color }}>
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium leading-none">{db.name}</div>
                  <div className="text-[11px] text-slate-500">{Object.keys(db.tables).length} tables</div>
                </div>
              </div>
              <Plus className="h-4 w-4 text-slate-400" onClick={(e) => { e.stopPropagation(); toggle(db.id); }} />
            </div>

            {expanded[db.id] && (
              <div className="px-2 pb-2">
                <div className="mt-2 flex gap-2">
                  <input
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="New table"
                    className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    onClick={() => {
                      if (!newTableName.trim()) return;
                      onAddTable(db.id, newTableName.trim());
                      setNewTableName('');
                      onSelectDb(db.id);
                    }}
                    className="inline-flex items-center justify-center rounded-md bg-sky-600 text-white px-2 py-1 text-sm hover:bg-sky-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  {Object.values(db.tables).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => { onSelectDb(db.id); onSelectTable(t.id); }}
                      className={`flex items-center gap-2 rounded px-2 py-1 cursor-pointer ${activeTableId === t.id && activeDbId === db.id ? 'bg-sky-100 dark:bg-sky-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'}`}
                    >
                      <TableIcon className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
