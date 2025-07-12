import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {database} from './database/db';
import orderRoutes from './routes/orders';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database before starting server
async function startServer() {
    try {
        // Initialize database
        console.log('🔄 Initializing database...');
        await database.initialize();
        console.log('✅ Database initialized successfully');

        // Middleware
        app.use(cors({
            origin: process.env.NODE_ENV === 'production'
                ? ['https://your-admin-portal.com', 'https://your-mobile-app.com']
                : true,
            credentials: true
        }));

        app.use(express.json({limit: '10mb'}));
        app.use(express.urlencoded({extended: true}));

        // Request logging middleware
        app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });

        // Health check endpoint
        app.get('/health', async (req, res) => {
            try {
                const stats = database.getStats();
                res.json({
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    database: {
                        connected: true,
                        stats
                    }
                });
            } catch (error) {
                res.status(500).json({
                    status: 'unhealthy',
                    timestamp: new Date().toISOString(),
                    database: {
                        connected: false,
                        error: 'Database connection failed'
                    }
                });
            }
        });

        // API routes
        app.use('/api/orders', orderRoutes);

        // 404 handler
        app.use((_, res) => {
            res.status(404).json({
                success: false,
                message: 'Endpoint not found'
            });
        });

        // Error handling middleware
        app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error('❌ Unhandled error:', err);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        });

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 POS Backend Server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`📦 Orders API: http://localhost:${PORT}/api/orders`);
            console.log(`💾 Database file: ${process.cwd()}/data/db.json`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down gracefully...');

    try {
        // Create backup before shutdown
        await database.createBackup();
        console.log('✅ Backup created successfully');
    } catch (error) {
        console.error('❌ Failed to create backup:', error);
    }

    console.log('👋 Server shut down complete');
    process.exit(0);
});

// Start the server
startServer();

export default app;
