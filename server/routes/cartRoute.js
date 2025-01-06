import express from 'express';
import {
    
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    addItemToCart,
} from '../controllers/cartController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const cartrouter = express.Router();

cartrouter.post('/',isAuthenticated, addItemToCart);
cartrouter.get('/',isAuthenticated, getCart);
cartrouter.put('/:itemId',isAuthenticated, updateCartItem);
cartrouter.delete('/:itemId',isAuthenticated, removeCartItem);
cartrouter.delete('/',isAuthenticated, clearCart);

export default cartrouter;
