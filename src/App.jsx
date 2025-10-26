import React, { useMemo, useState } from 'react';
import { Database as DbIcon, Moon, Sun } from 'lucide-react';
import HeroCover from './components/HeroCover';
import DatabaseExplorer from './components/DatabaseExplorer';
import MainWorkspace from './components/MainWorkspace';
import ChatSidebar from './components/ChatSidebar';

export default function App() {
  const [theme, setTheme] = useState('dark');

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  // Seed example data: two databases, connectable tables
  const seed = useMemo(() => {
    const db1Id = 'db_customers';
    const db2Id = 'db_orders';
    const customersTableId = 'tbl_customers';
    const addressesTableId = 'tbl_addresses';
    const ordersTableId = 'tbl_orders';
    const itemsTableId = 'tbl_items';

    const databases = {
      [db1Id]: {
        id: db1Id,
        name: 'CRM',
        color: '#3b82f6',
        tables: {
          [customersTableId]: {
            id: customersTableId,
            name: 'Customers',
            columns: [
              { id: 'id', name: 'id', type: 'number', pk: true },
              { id: 'name', name: 'name', type: 'text' },
              { id: 'state', name: 'state', type: 'text' },
              { id: 'email', name: 'email', type: 'text' },
              { id: 'created_at', name: 'created_at', type: 'date' },
            ],
            rows: [
              { id: 1, name: 'Alice Cooper', state: 'California', email: 'alice@example.com', created_at: '2024-01-10' },
              { id: 2, name: 'Bob Rivers', state: 'New York', email: 'bob@example.com', created_at: '2024-02-12' },
              { id: 3, name: 'Casey Stone', state: 'California', email: 'casey@example.com', created_at: '2024-03-18' },
            ],
          },
          [addressesTableId]: {
            id: addressesTableId,
            name: 'Addresses',
            columns: [
              { id: 'id', name: 'id', type: 'number', pk: true },
              { id: 'customer_id', name: 'customer_id', type: 'number', fk: { db: db1Id, table: customersTableId, column: 'id' } },
              { id: 'line1', name: 'line1', type: 'text' },
              { id: 'city', name: 'city', type: 'text' },
              { id: 'state', name: 'state', type: 'text' },
              { id: 'zip', name: 'zip', type: 'text' },
            ],
            rows: [
              { id: 1, customer_id: 1, line1: '123 Ocean Ave', city: 'San Diego', state: 'California', zip: '92101' },
              { id: 2, customer_id: 2, line1: '55 Broadway', city: 'New York', state: 'New York', zip: '10006' },
              { id: 3, customer_id: 3, line1: '77 Market St', city: 'San Francisco', state: 'California', zip: '94103' },
            ],
          },
        },
        relations: [
          { id: 'rel_addr_customer', from: { table: addressesTableId, column: 'customer_id' }, to: { table: customersTableId, column: 'id' }, type: 'many-to-one', onDelete: 'cascade' },
        ],
      },
      [db2Id]: {
        id: db2Id,
        name: 'Sales',
        color: '#0ea5e9',
        tables: {
          [ordersTableId]: {
            id: ordersTableId,
            name: 'Orders',
            columns: [
              { id: 'id', name: 'id', type: 'number', pk: true },
              { id: 'customer_id', name: 'customer_id', type: 'number', fk: { db: db1Id, table: customersTableId, column: 'id' } },
              { id: 'total', name: 'total', type: 'number' },
              { id: 'placed_at', name: 'placed_at', type: 'date' },
              { id: 'status', name: 'status', type: 'text' },
            ],
            rows: [
              { id: 101, customer_id: 1, total: 199.99, placed_at: '2024-04-01', status: 'paid' },
              { id: 102, customer_id: 1, total: 89.0, placed_at: '2024-04-22', status: 'paid' },
              { id: 103, customer_id: 2, total: 49.0, placed_at: '2024-05-01', status: 'pending' },
            ],
          },
          [itemsTableId]: {
            id: itemsTableId,
            name: 'Items',
            columns: [
              { id: 'id', name: 'id', type: 'number', pk: true },
              { id: 'order_id', name: 'order_id', type: 'number', fk: { db: db2Id, table: ordersTableId, column: 'id' } },
              { id: 'sku', name: 'sku', type: 'text' },
              { id: 'qty', name: 'qty', type: 'number' },
              { id: 'price', name: 'price', type: 'number' },
            ],
            rows: [
              { id: 1, order_id: 101, sku: 'TSHIRT-BLK', qty: 2, price: 29.5 },
              { id: 2, order_id: 101, sku: 'HAT-GRY', qty: 1, price: 15.0 },
              { id: 3, order_id: 102, sku: 'MUG-WHT', qty: 1, price: 12.0 },
            ],
          },
        },
        relations: [
          { id: 'rel_items_order', from: { table: itemsTableId, column: 'order_id' }, to: { table: ordersTableId, column: 'id' }, type: 'many-to-one', onDelete: 'cascade' },
          // Cross-database relation (Sales.Orders.customer_id -> CRM.Customers.id)
          { id: 'rel_orders_customer', from: { table: ordersTableId, column: 'customer_id' }, to: { db: db1Id, table: customersTableId, column: 'id' }, type: 'many-to-one', onDelete: 'restrict' },
        ],
      },
    };

    return { databases, activeDbId: db1Id, activeTableId: customersTableId };
  }, []);

  const [databases, setDatabases] = useState(seed.databases);
  const [activeDbId, setActiveDbId] = useState(seed.activeDbId);
  const [activeTableId, setActiveTableId] = useState(seed.activeTableId);
  const [filters, setFilters] = useState([]); // {column, op, value}

  const activeDb = databases[activeDbId];
  const activeTable = activeDb?.tables[activeTableId];

  function addDatabase(name) {
    const id = `db_${name.toLowerCase().replace(/\s+/g, '')}_${Date.now()}`;
    setDatabases((prev) => ({ ...prev, [id]: { id, name, color: '#3b82f6', tables: {}, relations: [] } }));
    setActiveDbId(id);
    setActiveTableId(undefined);
  }

  function addTable(dbId, name) {
    const tableId = `tbl_${name.toLowerCase().replace(/\s+/g, '')}_${Date.now()}`;
    setDatabases((prev) => {
      const db = prev[dbId];
      return {
        ...prev,
        [dbId]: {
          ...db,
          tables: {
            ...db.tables,
            [tableId]: { id: tableId, name, columns: [{ id: 'id', name: 'id', type: 'number', pk: true }], rows: [] },
          },
        },
      };
    });
    setActiveDbId(dbId);
    setActiveTableId(tableId);
  }

  function addRow(dbId, tableId) {
    setDatabases((prev) => {
      const db = prev[dbId];
      const table = db.tables[tableId];
      const nextId = table.rows.length ? Math.max(...table.rows.map((r) => Number(r.id) || 0)) + 1 : 1;
      return {
        ...prev,
        [dbId]: {
          ...db,
          tables: {
            ...db.tables,
            [tableId]: { ...table, rows: [...table.rows, { id: nextId }] },
          },
        },
      };
    });
  }

  function updateCell(dbId, tableId, rowIndex, columnId, value) {
    setDatabases((prev) => {
      const db = prev[dbId];
      const table = db.tables[tableId];
      const rows = [...table.rows];
      rows[rowIndex] = { ...rows[rowIndex], [columnId]: value };
      return {
        ...prev,
        [dbId]: { ...db, tables: { ...db.tables, [tableId]: { ...table, rows } } },
      };
    });
  }

  // Filtering logic for visual filters and chat queries
  function applyFilters(rows, columns, currentFilters) {
    return rows.filter((row) => {
      return currentFilters.every((f) => {
        const col = columns.find((c) => c.id === f.column);
        if (!col) return true;
        const v = row[f.column];
        const val = f.value;
        switch (f.op) {
          case 'contains':
            return String(v ?? '').toLowerCase().includes(String(val).toLowerCase());
          case 'equals':
            return String(v ?? '') === String(val);
          case 'starts with':
            return String(v ?? '').toLowerCase().startsWith(String(val).toLowerCase());
          case 'gt':
            return Number(v) > Number(val);
          case 'lt':
            return Number(v) < Number(val);
          case 'is':
            return (v === true && val === 'true') || (v === false && val === 'false');
          default:
            return true;
        }
      });
    });
  }

  const filteredRows = useMemo(() => {
    if (!activeTable) return [];
    return applyFilters(activeTable.rows, activeTable.columns, filters);
  }, [activeTable, filters]);

  function onNaturalLanguageQuery(text) {
    // Extremely simple NL parsing to demonstrate filter application without guidance
    // Examples: "Show me all customers from California", "orders status paid", "customers name starts with A"
    const t = text.toLowerCase();
    // Switch active table heuristically
    if (t.includes('order')) {
      setActiveDbId('db_orders');
      setActiveTableId('tbl_orders');
    } else if (t.includes('customer')) {
      setActiveDbId('db_customers');
      setActiveTableId('tbl_customers');
    }
    const newFilters = [];
    if (t.includes('from california') || t.includes('state california')) {
      newFilters.push({ column: 'state', op: 'equals', value: 'California' });
    }
    if (t.includes('status paid')) {
      newFilters.push({ column: 'status', op: 'equals', value: 'paid' });
    }
    const startsWithMatch = text.match(/name\s+starts\s+with\s+([A-Za-z])/i);
    if (startsWithMatch) {
      newFilters.push({ column: 'name', op: 'starts with', value: startsWithMatch[1] });
    }
    const containsMatch = text.match(/name\s+contains\s+"([^"]+)"/i) || text.match(/name\s+contains\s+([A-Za-z0-9]+)/i);
    if (containsMatch) {
      newFilters.push({ column: 'name', op: 'contains', value: containsMatch[1] });
    }
    setFilters(newFilters);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      <header className="relative w-full">
        <HeroCover />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur flex items-center justify-center shadow-sm border border-slate-200/60 dark:border-slate-800">
              <DbIcon className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <div className="font-semibold tracking-tight">NewSQL</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Visual, natural-language database manager</div>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 text-sm shadow-sm hover:bg-white dark:hover:bg-slate-900"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
          </button>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white dark:via-slate-950/30 dark:to-slate-950" />
      </header>

      <main className="flex-1 grid grid-cols-12 gap-0 border-t border-slate-200 dark:border-slate-800">
        <aside className="col-span-12 md:col-span-2 border-r border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-slate-950/50">
          <DatabaseExplorer
            databases={databases}
            activeDbId={activeDbId}
            activeTableId={activeTableId}
            onSelectDb={setActiveDbId}
            onSelectTable={setActiveTableId}
            onAddDatabase={addDatabase}
            onAddTable={addTable}
          />
        </aside>
        <section className="col-span-12 md:col-span-7 xl:col-span-8">
          <MainWorkspace
            databases={databases}
            activeDbId={activeDbId}
            activeTableId={activeTableId}
            onAddRow={addRow}
            onUpdateCell={updateCell}
            filters={filters}
            setFilters={setFilters}
            filteredRows={filteredRows}
          />
        </section>
        <aside className="col-span-12 md:col-span-3 xl:col-span-2 border-l border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-slate-950/50">
          <ChatSidebar onQuery={onNaturalLanguageQuery} />
        </aside>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 px-6 py-3 text-xs text-slate-500 flex items-center justify-between">
        <span>NewSQL · Visual Database System</span>
        <span>Made for demos · Not connected to a backend</span>
      </footer>
    </div>
  );
}
