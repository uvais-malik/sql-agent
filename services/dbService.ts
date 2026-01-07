import { MOCK_CUSTOMERS, MOCK_ORDERS, MOCK_PRODUCTS } from '../constants';
import { QueryResult, TableSchema } from '../types';

let SQL: any;

export const initSqlJs = async () => {
  if (!SQL) {
    // @ts-ignore
    if (!window.initSqlJs) {
      throw new Error("sql.js not loaded");
    }
    // @ts-ignore
    SQL = await window.initSqlJs({
      locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
    });
  }
  return SQL;
};

export const createDemoDatabase = async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // Create Tables
  db.run("CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, email TEXT, country TEXT, joined_at DATE);");
  db.run("CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount DECIMAL, status TEXT, order_date DATE);");
  db.run("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price DECIMAL, stock INTEGER);");

  // Insert Mock Data
  MOCK_CUSTOMERS.forEach((c: any) => {
    db.run("INSERT INTO customers VALUES (?, ?, ?, ?, ?)", [c.id, c.name, c.email, c.country, c.joined_at]);
  });
  MOCK_ORDERS.forEach((o: any) => {
    db.run("INSERT INTO orders VALUES (?, ?, ?, ?, ?)", [o.id, o.customer_id, o.amount, o.status, o.order_date]);
  });
  MOCK_PRODUCTS.forEach((p: any) => {
    db.run("INSERT INTO products VALUES (?, ?, ?, ?, ?)", [p.id, p.name, p.category, p.price, p.stock]);
  });

  return db;
};

export const createDatabaseFromBuffer = async (buffer: ArrayBuffer) => {
  const SQL = await initSqlJs();
  return new SQL.Database(new Uint8Array(buffer));
};

export const getDatabaseSchema = (db: any): { schema: TableSchema[], schemaString: string } => {
  const schema: TableSchema[] = [];
  try {
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");

    if (tables.length > 0 && tables[0].values) {
      tables[0].values.forEach((row: any[]) => {
        const tableName = row[0];
        const columnsInfo = db.exec(`PRAGMA table_info("${tableName}")`);
        
        if (columnsInfo.length > 0 && columnsInfo[0].values) {
          const columns = columnsInfo[0].values.map((col: any[]) => ({
            name: col[1], // name
            type: col[2], // type
          }));
          schema.push({ tableName, columns });
        }
      });
    }
  } catch (e) {
    console.error("Error extracting schema", e);
  }

  const schemaString = schema.map(t => {
    const cols = t.columns.map(c => `${c.name} (${c.type})`).join(', ');
    return `Table: ${t.tableName}\nColumns: ${cols}`;
  }).join('\n\n');

  return { schema, schemaString };
};

export const executeQuery = (db: any, sql: string): QueryResult => {
  if (!db) return { columns: [], rows: [], error: "Database not initialized" };
  
  try {
    const start = performance.now();
    const result = db.exec(sql);
    const end = performance.now();

    if (result.length === 0) {
      // Check if it was a non-select query that succeeded (like update/insert)
      // sql.js exec returns [] for queries that don't return rows
      return { columns: [], rows: [], executionTime: end - start };
    }

    const columns = result[0].columns;
    const values = result[0].values;
    const rows = values.map((val: any[]) => {
      const rowObj: any = {};
      columns.forEach((col: string, i: number) => {
        rowObj[col] = val[i];
      });
      return rowObj;
    });

    return { columns, rows, executionTime: end - start };
  } catch (err: any) {
    return { columns: [], rows: [], error: err.message };
  }
};