import { TableSchema, Customer, Order, Product } from './types';

// Used for Demo Data initialization in dbService.ts
export const DB_SCHEMA: TableSchema[] = [
  {
    tableName: 'customers',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique identifier for the customer' },
      { name: 'name', type: 'TEXT', description: 'Full name of the customer' },
      { name: 'email', type: 'TEXT', description: 'Email address' },
      { name: 'country', type: 'TEXT', description: 'Country code (e.g., US, UK, CA)' },
      { name: 'joined_at', type: 'DATE', description: 'Date when the customer joined' },
    ],
  },
  {
    tableName: 'orders',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique identifier for the order' },
      { name: 'customer_id', type: 'INTEGER', description: 'Foreign key to customers table' },
      { name: 'amount', type: 'DECIMAL', description: 'Total order amount in USD' },
      { name: 'status', type: 'TEXT', description: 'Order status: pending, shipped, delivered, cancelled' },
      { name: 'order_date', type: 'DATE', description: 'Date the order was placed' },
    ],
  },
  {
    tableName: 'products',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique identifier for the product' },
      { name: 'name', type: 'TEXT', description: 'Product name' },
      { name: 'category', type: 'TEXT', description: 'Product category' },
      { name: 'price', type: 'DECIMAL', description: 'Unit price' },
      { name: 'stock', type: 'INTEGER', description: 'Current stock quantity' },
    ],
  },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", country: "US", joined_at: "2023-01-15" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", country: "UK", joined_at: "2023-02-20" },
  { id: 3, name: "Charlie Davis", email: "charlie@data.com", country: "CA", joined_at: "2023-03-10" },
  { id: 4, name: "Diana Prince", email: "diana@themyscira.net", country: "GR", joined_at: "2023-05-01" },
  { id: 5, name: "Evan Wright", email: "evan@tech.io", country: "US", joined_at: "2023-06-15" },
];

export const MOCK_ORDERS: Order[] = [
  { id: 101, customer_id: 1, amount: 120.50, status: 'delivered', order_date: "2024-01-10" },
  { id: 102, customer_id: 2, amount: 450.00, status: 'shipped', order_date: "2024-01-12" },
  { id: 103, customer_id: 1, amount: 60.00, status: 'delivered', order_date: "2024-01-15" },
  { id: 104, customer_id: 3, amount: 1200.99, status: 'pending', order_date: "2024-02-01" },
  { id: 105, customer_id: 4, amount: 35.00, status: 'cancelled', order_date: "2024-02-05" },
  { id: 106, customer_id: 5, amount: 210.25, status: 'delivered', order_date: "2024-02-10" },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: "Laptop Pro", category: "Electronics", price: 1200.00, stock: 50 },
  { id: 2, name: "Wireless Mouse", category: "Electronics", price: 25.50, stock: 200 },
  { id: 3, name: "Ergonomic Chair", category: "Furniture", price: 350.00, stock: 15 },
  { id: 4, name: "Coffee Maker", category: "Appliances", price: 85.00, stock: 40 },
  { id: 5, name: "Desk Lamp", category: "Furniture", price: 45.00, stock: 100 },
];