// lib/db.ts
import mysql from 'mysql2/promise';

declare global {
  // allow global pool across hot-reloads in dev
  var __mysqlPool: mysql.Pool | undefined;
}

if (!global.__mysqlPool) {
  global.__mysqlPool = mysql.createPool({
    host: process.env.NEXT_PUBLIC_DB_HOST,
    user: process.env.NEXT_PUBLIC_DB_USER,
    password: process.env.NEXT_PUBLIC_DB_PASSWORD,
    database: process.env.NEXT_PUBLIC_DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

const pool = global.__mysqlPool;

export default pool;
