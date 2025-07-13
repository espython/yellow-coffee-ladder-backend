import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderRequest, CreateOrderResponse, Order, OrderItem } from '../types/order';
import { validateOrderRequest } from '../middleware/validation';
import { orderStorage } from '../utils/storage';

const router = Router();

// POST /orders - Create a new order
router.post('/', validateOrderRequest, async (
    req: Request<{}, CreateOrderResponse, CreateOrderRequest>,
    res: Response<CreateOrderResponse>
): Promise<void> => {
    try {
        const { items } = req.body;
        const timestamp = new Date().toISOString();
        const orderId = uuidv4();

        // Create order items with IDs
        const orderItems: OrderItem[] = items.map(item => ({
            ...item,
            id: uuidv4()
        }));

        // Calculate total price
        const totalPrice = orderItems.reduce((total, item) =>
            total + (item.price * item.quantity), 0
        );

        // Create order object
        const order: Order = {
            id: orderId,
            items: orderItems,
            totalPrice: Math.round(totalPrice * 100) / 100,
            timestamp,
            status: 'pending'
        };

        // Store the order in database
        await orderStorage.addOrder(order);

        // Log the order
        console.log(`✅ New order created: ${orderId} - Total: $${order.totalPrice}`);

        // Return success response
        res.status(201).json({
            success: true,
            orderId,
            timestamp,
            message: 'Order created successfully'
        });

    } catch (error) {
        console.error('❌ Error creating order:', error);
        res.status(500).json({
            success: false,
            orderId: '',
            timestamp: new Date().toISOString(),
            message: 'Internal server error'
        });
    }
});

// GET /orders - Get all orders (for admin portal) with optional filters
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, search, dateRange } = req.query;
        let orders = await orderStorage.getAllOrders();
        
        // Filter by status if provided
        if (status && typeof status === 'string') {
            if (!['pending', 'completed', 'cancelled'].includes(status)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid status parameter. Use: pending, completed, or cancelled'
                });
                return;
            }
            orders = orders.filter(order => order.status === status);
        }
        
        // Filter by search term (product name)
        if (search && typeof search === 'string') {
            const searchTerm = search.toLowerCase();
            orders = orders.filter(order => 
                order.items.some(item => 
                    item.name.toLowerCase().includes(searchTerm)
                )
            );
        }
        
        // Filter by date range
        if (dateRange && typeof dateRange === 'string') {
            const now = new Date();
            let startDate: Date;
            
            switch (dateRange) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate = new Date(now);
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    startDate = new Date(now);
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
                default:
                    res.status(400).json({
                        success: false,
                        message: 'Invalid dateRange parameter. Use: today, week, month, or year'
                    });
                    return;
            }
            
            orders = orders.filter(order => {
                const orderDate = new Date(order.timestamp);
                return orderDate >= startDate && orderDate <= now;
            });
        }

        const stats = await orderStorage.getStats();

        res.json({
            success: true,
            orders,
            count: orders.length,
            stats,
            filters: { status, search, dateRange } // Return applied filters for reference
        });
    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// GET /orders/:id - Get specific order
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const order = await orderStorage.getOrderById(id);

        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found'
            });
            return;
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('❌ Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// PUT /orders/:id/status - Update order status
router.patch('/:id/status', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Valid status is required (pending, completed, cancelled)'
            });
            return;
        }

        const updated = await orderStorage.updateOrderStatus(id, status);

        if (!updated) {
            res.status(404).json({
                success: false,
                message: 'Order not found'
            });
            return;
        }

        res.json({
            success: true,
            message: `Order status updated to ${status}`
        });
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// GET /orders/stats - Get database statistics
router.get('/api/stats', async (req: Request, res: Response): Promise<void> => {
    try {
        const stats = await orderStorage.getStats();
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('❌ Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

export default router;
