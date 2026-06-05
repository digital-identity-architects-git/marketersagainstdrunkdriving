/**
 * Database migration entry point.
 *
 * The schema is defined in `initDatabase()` (see connection.ts) and is also
 * run automatically when the server boots, so a successful server start will
 * already have created every table. This script exists so the documented
 * `npm run db:migrate` step works for provisioning a fresh database up front
 * (e.g. before the first deploy) without starting the full server.
 *
 * Run: npm run db:migrate
 */
import { initDatabase, closeDatabase } from './connection.js';

async function migrate(): Promise<void> {
  console.log('Running database migration (creating tables if not present)...');
  await initDatabase();
  await closeDatabase();
  console.log('✓ Migration complete');
  process.exit(0);
}

migrate().catch((error) => {
  console.error('✗ Migration failed:', error);
  process.exit(1);
});
