// NEU (ESM)
import mysql from 'mysql2/promise.js'; // ← optional: promise-basierte Version
const db = mysql.createPool({
  host: 'localhost',
  user: 'timmy',
  password: 'Kann ich aber nicht speichern!123',
  database: 'lehrwerk',
});
export default db;
