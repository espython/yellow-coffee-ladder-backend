import { Order } from '../types/order';
import { database } from '../database/db';

export class OrderStorage {
    private async getDb() {
        return database.getDatabase();
    }

    async addOrder(order: Order): Promise<void> {
        try {
            const db = await this.getDb();

            // Add order to the beginning of array (most recent first)
            db.data.orders.unshift(order);

            // Update metadata
            await database.updateMetadata();

            console.log(`💾 Order saved to database: ${order.id}`);
        } catch (error) {
            console.error('❌ Failed to save order:', error);
            throw new Error('Failed to save order to database');
        }
    }

    async getAllOrders(): Promise<Order[]> {
        try {
            const db = await this.getDb();

            // Return orders sorted by timestamp (most recent first)
            return [...db.data.orders].sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
        } catch (error) {
            console.error('❌ Failed to fetch orders:', error);
            throw new Error('Failed to fetch orders from database');
        }
    }

    async getOrderById(id: string): Promise<Order | undefined> {
        try {
            const db = await this.getDb();
            return db.data.orders.find(order => order.id === id);
        } catch (error) {
            console.error('❌ Failed to fetch order by ID:', error);
            throw new Error('Failed to fetch order from database');
        }
    }

    async getOrdersCount(): Promise<number> {
        try {
            const db = await this.getDb();
            return db.data.orders.length;
        } catch (error) {
            console.error('❌ Failed to get orders count:', error);
            return 0;
        }
    }

    async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
        try {
            const db = await this.getDb();

            return db.data.orders.filter(order => {
                const orderDate = new Date(order.timestamp);
                return orderDate >= startDate && orderDate <= endDate;
            });
        } catch (error) {
            console.error('❌ Failed to fetch orders by date range:', error);
            throw new Error('Failed to fetch orders by date range');
        }
    }

    async updateOrderStatus(id: string, status: Order['status']): Promise<boolean> {
        try {
            const db = await this.getDb();
            const orderIndex = db.data.orders.findIndex(order => order.id === id);

            if (orderIndex === -1) {
                return false;
            }

            db.data.orders[orderIndex].status = status;
            await database.updateMetadata();

            console.log(`📝 Order status updated: ${id} -> ${status}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to update order status:', error);
            throw new Error('Failed to update order status');
        }
    }

    async deleteOrder(id: string): Promise<boolean> {
        try {
            const db = await this.getDb();
            const initialLength = db.data.orders.length;

            db.data.orders = db.data.orders.filter(order => order.id !== id);

            if (db.data.orders.length < initialLength) {
                await database.updateMetadata();
                console.log(`🗑️ Order deleted: ${id}`);
                return true;
            }

            return false;
        } catch (error) {
            console.error('❌ Failed to delete order:', error);
            throw new Error('Failed to delete order');
        }
    }

    // Clear all orders (useful for testing)
    async clear(): Promise<void> {
        try {
            const db = await this.getDb();
            db.data.orders = [];
            await database.updateMetadata();
            console.log('🧹 All orders cleared from database');
        } catch (error) {
            console.error('❌ Failed to clear orders:', error);
            throw new Error('Failed to clear orders');
        }
    }

    // Get database statistics
    async getStats() {
        return database.getStats();
    }
}

export const orderStorage = new OrderStorage();
