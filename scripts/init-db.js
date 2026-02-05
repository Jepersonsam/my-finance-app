// Script to initialize database tables
// Run with: node --loader ts-node/esm scripts/init-db.js
// Or use: npm run init-db (after adding to package.json)

// Note: This script is optional. Database tables will be auto-created
// when API routes are first called. This script is just for manual initialization.

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Dynamic import for ES modules
const dbModule = await import('../lib/db.js');
const { initDatabase } = dbModule;

async function main() {
  try {
    console.log('Initializing database...');
    await initDatabase();
    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

main();
