import { QueryResult, MockDatabase } from '../types';
import { MOCK_CUSTOMERS, MOCK_ORDERS, MOCK_PRODUCTS } from '../constants';

// Initialize mock DB
const db: MockDatabase = {
  customers: MOCK_CUSTOMERS,
  orders: MOCK_ORDERS,
  products: MOCK_PRODUCTS,
};

/**
 * A very basic mock SQL executor.
 * It detects the main table being queried and applies simple logic.
 * In a real app, you would send the SQL to a backend or use sql.js.
 */
export const executeMockQuery = async (sql: string): Promise<QueryResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const lowerSql = sql.toLowerCase().trim();
        
        // Safety check
        if (!lowerSql.startsWith('select')) {
          resolve({
            columns: [],
            rows: [],
            error: "Security Alert: Only SELECT statements are allowed in this demo."
          });
          return;
        }

        let data: any[] = [];
        let columns: string[] = [];

        // Naive parsing to determine which table is primary
        // This is purely for demonstration purposes to show UI flow
        if (lowerSql.includes('from customers')) {
          data = db.customers;
          columns = Object.keys(db.customers[0]);
        } else if (lowerSql.includes('from orders')) {
          data = db.orders;
          columns = Object.keys(db.orders[0]);
        } else if (lowerSql.includes('from products')) {
          data = db.products;
          columns = Object.keys(db.products[0]);
        } else {
           resolve({
            columns: [],
            rows: [],
            error: "Mock DB Error: Could not determine table from query. Try querying 'customers', 'orders', or 'products'."
          });
          return;
        }

        // Extremely basic filtering simulation
        let filteredData = [...data];

        // Filter by 'id' if present
        const idMatch = lowerSql.match(/id\s*=\s*(\d+)/);
        if (idMatch) {
            const id = parseInt(idMatch[1]);
            filteredData = filteredData.filter(d => d.id === id);
        }
        
        // Filter by 'status' if present (for orders)
        const statusMatch = lowerSql.match(/status\s*=\s*['"](\w+)['"]/);
        if (statusMatch) {
            const status = statusMatch[1];
            filteredData = filteredData.filter(d => d['status'] === status);
        }

        // Filter by 'country' if present (for customers)
         const countryMatch = lowerSql.match(/country\s*=\s*['"](\w+)['"]/);
         if (countryMatch) {
             const country = countryMatch[1];
             filteredData = filteredData.filter(d => d['country'] === country);
         }

        // Simple aggregation simulation (COUNT)
        if (lowerSql.includes('count(')) {
             resolve({
                columns: ['count'],
                rows: [{ count: filteredData.length }],
                executionTime: Math.random() * 50
             });
             return;
        }
        
        // Simple aggregation simulation (SUM)
        if (lowerSql.includes('sum(') && lowerSql.includes('amount')) {
            const total = filteredData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
            resolve({
                columns: ['total_amount'],
                rows: [{ total_amount: total.toFixed(2) }],
                executionTime: Math.random() * 50
            });
            return;
        }

        resolve({
          columns,
          rows: filteredData,
          executionTime: Math.random() * 100
        });

      } catch (e: any) {
        resolve({
          columns: [],
          rows: [],
          error: `Execution Error: ${e.message}`
        });
      }
    }, 600); // Simulate network latency
  });
};