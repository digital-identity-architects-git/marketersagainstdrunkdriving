import { initDatabase, closeDatabase } from './connection.js';
async function migrate() {
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
//# sourceMappingURL=migrate.js.map