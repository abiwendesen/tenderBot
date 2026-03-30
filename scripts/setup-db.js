import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'tenderbot',
});

const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
const sql = fs.readFileSync(schemaPath, 'utf8');

try {
  await pool.query(sql);
  console.log('Database schema created successfully.');
} catch (err) {
  if (err.code === '3D000') {
    console.error('Database does not exist. Create it first (e.g. with pgAdmin or: createdb tenderbot)');
  } else {
    console.error('Error:', err.message);
  }
  process.exit(1);
} finally {
  await pool.end();
}
