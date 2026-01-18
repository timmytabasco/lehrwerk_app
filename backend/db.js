
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);


dotenv.config({ path: path.resolve(__dirname, '../.env') });

import mysql from 'mysql2/promise.js';


['DB_HOST','DB_USER','DB_PASSWORD','DB_NAME'].forEach(k => {
  if (!process.env[k]) {
    console.error(`❌ Missing env var: ${k}`);
  }
});

const db = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // optional nice-to-have:
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


export default db;
