import React, { useMemo, useState } from 'react';
import { Filter, Plus, Upload, Download, Play } from 'lucide-react';

function Badge({ children }) {
  return <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] text-slate-600 dark:text-slate-300">{children}</span>;
}

export default function MainWorkspace({ databases, activeDbId, activeTableId, onAddRow, onUpdateCell, filters, setFilters, filteredRows }) {
  const [activeTab, setActiveTab] = useState('table'); // table | schema | filters | erd
  const activeDb = databases[activeDbId];
  const activeTable = activeDb?.tables[activeTableId];

  const columns = activeTable?.columns || [];

  const columnOptions = useMemo(() => columns.map((c) => ({ value: c.id, label: c.name })), [columns]);

  function addFilter() {
    const firstCol = columns.find((c) => !c.pk) || columns[0];
    if (!firstCol) return;
    setFilters([...(filters || []), { column: firstCol.id, op: 'contains', value: '' }]);
  }

  function updateFilter(i, patch) {
    const next = [...filters];
    next[i] = { ...next[i], ...patch };
    setFilters(next);
  }

  function removeFilter(i) {
    const next = [...filters];
    next.splice(i, 1);
    setFilters(next);
  }

  function exportJSON() {
    if (!activeDb || !activeTable) return;
    const payload = { database: activeDb.name, table: activeTable.name, columns: activeTable.columns, rows: activeTable.rows };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDb.name}_${activeTable.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const relationEdges = useMemo(() => {
    // Build flat list of relations including cross-db
    const edges = [];
    Object.values(databases).forEach((db) => {
      (db.relations || []).forEach((r) => {
        const fromDbId = db.id;
        const toDbId = r.to?.db || db.id;
        edges.push({ fromDbId, from: r.from, toDbId, to: r.to, type: r.type });
      });
    });
    return edges;
  }, [databases]);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-slate-200 dark:border-slate-800 px-4 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">{activeDb ? activeDb.name : 'Select a database'}</div>
            <h2 className="text-lg font-semibold tracking-tight">{activeTable ? activeTable.name : 'No table selected'}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('table')} className={`px-3 py-1.5 rounded-md text-sm ${activeTab==='table' ? 'bg-sky-600 text-white' : 'border border-slate-200 dark:border-slate-800'}`}>Table</button>
            <button onClick={() => setActiveTab('schema')} className={`px-3 py-1.5 rounded-md text-sm ${activeTab==='schema' ? 'bg-sky-600 text-white' : 'border border-slate-200 dark:border-slate-800'}`}>Schema</button>
            <button onClick={() => setActiveTab('filters')} className={`px-3 py-1.5 rounded-md text-sm ${activeTab==='filters' ? 'bg-sky-600 text-white' : 'border border-slate-200 dark:border-slate-800'}`}><Filter className="h-4 w-4 inline mr-1" />Filters</button>
            <button onClick={() => setActiveTab('erd')} className={`px-3 py-1.5 rounded-md text-sm ${activeTab==='erd' ? 'bg-sky-600 text-white' : 'border border-slate-200 dark:border-slate-800'}`}>Relationships</button>
          </div>
        </div>
        <div className="py-2 text-xs text-slate-500 flex items-center gap-2">
          <Badge>PK</Badge>
          <Badge>FK</Badge>
          <Badge>Media</Badge>
          <Badge>Computed</Badge>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'table' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800">
              <div className="text-sm text-slate-500">{filteredRows?.length || 0} rows</div>
              <div className="flex items-center gap-2">
                <button onClick={() => onAddRow(activeDbId, activeTableId)} className="inline-flex items-center gap-1 rounded-md bg-sky-600 text-white px-3 py-1.5 text-sm hover:bg-sky-700"><Plus className="h-4 w-4" />Add row</button>
                <button onClick={exportJSON} className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-sm"><Download className="h-4 w-4" />Export</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/60 backdrop-blur border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    {columns.map((c) => (
                      <th key={c.id} className="text-left px-3 py-2 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {c.name}{' '}
                        {c.pk && <span className="text-[10px] text-sky-600 border border-sky-600 rounded px-1 ml-1">PK</span>}
                        {c.fk && <span className="text-[10px] text-emerald-600 border border-emerald-600 rounded px-1 ml-1">FK</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-slate-100 dark:border-slate-900/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                      {columns.map((c) => (
                        <td key={c.id} className="px-3 py-2 align-top">
                          <CellEditor
                            value={row[c.id]}
                            column={c}
                            onChange={(val) => onUpdateCell(activeDbId, activeTableId, rIdx, c.id, val)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'schema' && (
          <SchemaDesigner activeDb={activeDb} activeTableId={activeTableId} />
        )}

        {activeTab === 'filters' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800">
              <div className="text-sm text-slate-600 dark:text-slate-300">Build your query visually</div>
              <div className="flex items-center gap-2">
                <button onClick={addFilter} className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-sm"><Plus className="h-4 w-4" />Add condition</button>
                <button onClick={() => {}} className="inline-flex items-center gap-1 rounded-md bg-emerald-600 text-white px-3 py-1.5 text-sm"><Play className="h-4 w-4" />Preview</button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {(filters || []).length === 0 && <div className="text-sm text-slate-500">No filters yet. Add a condition.</div>}
              {(filters || []).map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={f.column}
                    onChange={(e) => updateFilter(i, { column: e.target.value })}
                    className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1 text-sm"
                  >
                    {columnOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <select
                    value={f.op}
                    onChange={(e) => updateFilter(i, { op: e.target.value })}
                    className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1 text-sm"
                  >
                    <option>contains</option>
                    <option>equals</option>
                    <option>starts with</option>
                    <option>gt</option>
                    <option>lt</option>
                    <option>is</option>
                  </select>
                  <input
                    value={f.value}
                    onChange={(e) => updateFilter(i, { value: e.target.value })}
                    placeholder="Value"
                    className="w-40 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1 text-sm"
                  />
                  <button onClick={() => removeFilter(i)} className="text-xs text-slate-500 hover:underline">Remove</button>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800">
              <div className="px-4 py-2 text-xs uppercase tracking-wide text-slate-500">Preview</div>
              <div className="max-h-64 overflow-auto px-4 pb-4">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      {columns.map((c) => (
                        <th key={c.id} className="text-left px-3 py-2 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{c.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-100 dark:border-slate-900/60">
                        {columns.map((c) => (
                          <td key={c.id} className="px-3 py-2">{String(row[c.id] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'erd' && (
          <ERDCanvas databases={databases} activeDbId={activeDbId} />
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between">
        <div className="text-xs text-slate-500">Import/Export • Validation • Audit Log • Templates</div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs"><Upload className="h-4 w-4" />Import</button>
          <button onClick={exportJSON} className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs"><Download className="h-4 w-4" />Export</button>
        </div>
      </div>
    </div>
  );
}

function CellEditor({ value, column, onChange }) {
  if (column.type === 'boolean') {
    return (
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
    );
  }
  if (column.type === 'number') {
    return (
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1 text-sm"
      />
    );
  }
  if (column.type === 'date') {
    return (
      <input
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1 text-sm"
      />
    );
  }
  return (
    <input
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1 text-sm"
    />
  );
}

function SchemaDesigner({ activeDb, activeTableId }) {
  if (!activeDb) return <div className="h-full grid place-items-center text-slate-500">Select a database</div>;
  return (
    <div className="h-full overflow-auto p-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(activeDb.tables).map((t) => (
          <div key={t.id} className={`rounded-lg border ${t.id === activeTableId ? 'border-sky-500' : 'border-slate-200 dark:border-slate-800'} bg-white/60 dark:bg-slate-950/60`}> 
            <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="font-medium text-sm">{t.name}</div>
              {t.id === activeTableId && <span className="text-[10px] text-sky-600 border border-sky-600 rounded px-1">Active</span>}
            </div>
            <div className="p-3 space-y-1">
              {t.columns.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <div className="text-slate-700 dark:text-slate-200">{c.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    {c.pk && <span className="text-[10px] text-sky-600 border border-sky-600 rounded px-1">PK</span>}
                    {c.fk && <span className="text-[10px] text-emerald-600 border border-emerald-600 rounded px-1">FK</span>}
                    <span className="uppercase">{c.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-xs text-slate-500">Drag-and-drop editing not implemented in this demo.</div>
    </div>
  );
}

function ERDCanvas({ databases, activeDbId }) {
  const dbList = Object.values(databases);
  const nodes = [];
  const edges = [];

  dbList.forEach((db, di) => {
    const x = 80 + di * 420;
    const y = 80;
    nodes.push({ id: db.id, x, y, label: db.name, color: db.color });
    Object.values(db.tables).forEach((t, ti) => {
      nodes.push({ id: `${db.id}:${t.id}`, x, y: y + 80 + ti * 140, label: t.name, isTable: true, dbId: db.id });
    });
    (db.relations || []).forEach((r) => {
      const fromId = `${db.id}:${r.from.table}`;
      const toDbId = r.to?.db || db.id;
      const toId = `${toDbId}:${r.to.table}`;
      edges.push({ from: fromId, to: toId, type: r.type });
    });
  });

  function findNode(id) { return nodes.find((n) => n.id === id); }

  return (
    <div className="h-full relative">
      <svg className="absolute inset-0 w-full h-full">
        {edges.map((e, i) => {
          const a = findNode(e.from);
          const b = findNode(e.to);
          if (!a || !b) return null;
          const x1 = a.x + 160;
          const y1 = a.y + 40;
          const x2 = b.x + 160;
          const y2 = b.y + 40;
          const dx = Math.abs(x2 - x1) / 2;
          const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
          return (
            <g key={i}>
              <path d={path} stroke="rgb(59,130,246)" strokeWidth="1.5" fill="none" opacity="0.6" />
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} className="text-[10px] fill-slate-500" textAnchor="middle">{e.type}</text>
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 p-6">
        <div className="relative w-full h-full">
          {nodes.map((n) => (
            <div
              key={n.id}
              className={`absolute rounded-lg ${n.isTable ? 'border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/60' : ''}`}
              style={{ left: n.x, top: n.y, width: 320 }}
            >
              <div className={`px-3 py-2 ${n.isTable ? 'border-b border-slate-200 dark:border-slate-800' : ''}`} style={!n.isTable ? { backgroundColor: n.color, color: 'white', borderRadius: 8 } : {}}>
                <div className="text-sm font-medium">{n.label}</div>
                {!n.isTable && <div className="text-[11px] opacity-80">Database</div>}
                {n.isTable && <div className="text-[11px] text-slate-500">Table</div>}
              </div>
              {n.isTable && (
                <div className="p-3 text-xs text-slate-500">Part of {databases[n.dbId].name}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
