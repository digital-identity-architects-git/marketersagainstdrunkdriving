import express, { Express } from 'express';
import cors from 'cors';
import { initDatabase } from './db/connection.js';
import apiRoutes from './routes/api.js';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Initialize and start
async function start() {
  try {
    console.log('🚀 Starting Marketers Against Drunk Driving API...');
    
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

start();
