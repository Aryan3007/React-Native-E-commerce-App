import express from 'express';
import { handlePayment } from '../controllers/paymentController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const paymentrouter = express.Router();

paymentrouter.post('/', isAuthenticated, handlePayment); 

export default paymentrouter;
