import express from 'express';
import cors from 'cors';
import { initDatabase } from './db/connection.js';
import apiRoutes from './routes/api.js';
import { startDailySocialScheduler } from './listeners/dailySocialScheduler.js';
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);
async function start() {
    try {
        console.log('🚀 Starting Marketers Against Drunk Driving API...');
        await initDatabase();
        startDailySocialScheduler();
        app.listen(PORT, () => {
            console.log(`✓ Server running on http://localhost:${PORT}`);
            console.log(`✓ API available at http://localhost:${PORT}/api`);
        });
    }
    catch (error) {
        console.error('✗ Failed to start server:', error);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=index.js.map