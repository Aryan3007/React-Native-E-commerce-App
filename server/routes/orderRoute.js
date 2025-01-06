import express from 'express';
import { createOrder, getUserOrders, updateOrderStatus, cancelOrder } from '../controllers/orderController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const orderRouter = express.Router();

orderRouter.post('/', isAuthenticated, createOrder); // Create an order
orderRouter.get('/', isAuthenticated, getUserOrders); // Get user orders
orderRouter.patch('/:orderId', isAuthenticated, updateOrderStatus); // Update order status
orderRouter.delete('/:orderId', isAuthenticated, cancelOrder); // Cancel an order

export default orderRouter;
