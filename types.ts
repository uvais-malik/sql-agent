export interface TableSchema {
  tableName: string;
  columns: {
    name: string;
    type: string;
    description?: string;
  }[];
}

export interface QueryResult {
  columns: string[];
  rows: any[];
  error?: string;
  executionTime?: number;
}

export interface ChatState {
  question: string;
  isLoading: boolean;
  generatedSql: string | null;
  queryResult: QueryResult | null;
  error: string | null;
}

// Mock Database Types
export interface Customer {
  id: number;
  name: string;
  email: string;
  country: string;
  joined_at: string;
}

export interface Order {
  id: number;
  customer_id: number;
  amount: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  order_date: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface MockDatabase {
  customers: Customer[];
  orders: Order[];
  products: Product[];
}