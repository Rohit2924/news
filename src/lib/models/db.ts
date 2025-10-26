import { Pool, PoolClient } from 'pg';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  // Alternative configuration (use if not using DATABASE_URL)
  // host: process.env.DB_HOST,
  // port: parseInt(process.env.DB_PORT || '5432'),
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME,
  
  // SSL configuration (important for production)
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
    
  // Pool configuration
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test the connection on startup
pool.on('connect', (client) => {
  console.log('New client connected to PostgreSQL');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Export the pool to be used in API routes
export default pool;

// Helper function to get a client from the pool
export const getClient = (): Promise<PoolClient> => {
  return pool.connect();
};

// Helper function to execute queries
export const query = (text: string, params?: any[]) => {
  console.log('Executing query:', text, params);
  return pool.query(text, params);
};

// Test database connection
export const testConnection = async (): Promise<{ success: boolean; message: string; details?: any }> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    client.release();
    
    return {
      success: true,
      message: 'Database connection successful',
      details: {
        current_time: result.rows[0].current_time,
        postgres_version: result.rows[0].postgres_version,
        pool_total_count: pool.totalCount,
        pool_idle_count: pool.idleCount,
        pool_waiting_count: pool.waitingCount
      }
    };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return {
      success: false,
      message: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  pool.end(() => {
    console.log('Database pool has ended');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  pool.end(() => {
    console.log('Database pool has ended');
    process.exit(0);
  });
});