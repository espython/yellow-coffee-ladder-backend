import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import { Order } from '../types/order';

// Database schema interface
interface DatabaseSchema {
    orders: Order[];
    metadata: {
        version: string;
        createdAt: string;
        lastUpdated: string;
    };
}

// Default data structure
const defaultData: DatabaseSchema = {
    orders: [],
    metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    }
};

class Database {
    private db: Low<DatabaseSchema> | null = null;
    private readonly dbPath: string;

    constructor() {
        // Create data directory if it doesn't exist
        const dataDir = join(process.cwd(), 'data');
        if (!existsSync(dataDir)) {
            mkdirSync(dataDir, { recursive: true });
        }

        this.dbPath = join(dataDir, 'db.json');
    }

    async initialize(): Promise<void> {
        try {
            // Create adapter and database instance
            const adapter = new JSONFile<DatabaseSchema>(this.dbPath);
            this.db = new Low(adapter, defaultData);

            // Read data from file
            await this.db.read();

            // Initialize with default data if file is empty
            if (!this.db.data) {
                this.db.data = defaultData;
                await this.db.write();
                console.log('📁 Database initialized with default data');
            } else {
                console.log('📁 Database loaded successfully');
                console.log(`📊 Current orders count: ${this.db.data.orders?.length || 0}`);
            }
        } catch (error) {
            console.error('❌ Failed to initialize database:', error);
            throw new Error('Database initialization failed');
        }
    }

    getDatabase(): Low<DatabaseSchema> {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.db;
    }

    async updateMetadata(): Promise<void> {
        if (!this.db) return;

        this.db.data.metadata.lastUpdated = new Date().toISOString();
        await this.db.write();
    }

    // Backup functionality
    async createBackup(): Promise<string> {
        if (!this.db) throw new Error('Database not initialized');

        const backupPath = join(process.cwd(), 'data', `backup-${Date.now()}.json`);
        const backupAdapter = new JSONFile<DatabaseSchema>(backupPath);
        const backupDb = new Low(backupAdapter, this.db.data);

        await backupDb.write();
        console.log(`📋 Backup created: ${backupPath}`);
        return backupPath;
    }

    // Get database statistics
    getStats() {
        if (!this.db) return null;

        const orders = this.db.data.orders;
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
            totalOrders,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            avgOrderValue: Math.round(avgOrderValue * 100) / 100,
            lastUpdated: this.db.data.metadata.lastUpdated
        };
    }
}

// Export singleton instance
export const database = new Database();
