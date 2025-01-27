import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRouter from './routes/authRoute.js';
import productRouter from './routes/productRoute.js';
import categoryrouter from './routes/categoryRoutes.js';
import cartrouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import wishlistrouter from './routes/wishlistRoute.js';
import paymentrouter from './routes/paymentRoute.js';
import storeRouter from './routes/storeRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded


console.log(process.env.MONGO_URL);

// Connect to database
const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Connected to MongoDB: ${connect.connection.host}`);
    } catch (error) {
        console.log(`Error in MongoDB connection: ${error}`);
        process.exit(1); // Exit the process with failure
    }
};
connectDB();

app.use('/api/v1', authRouter);
app.use('/api/v1', productRouter);
app.use('/api/v1', storeRouter);
app.use('/api/v1/category', categoryrouter);
app.use('/api/v1/cart', cartrouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/wishlist', wishlistrouter);
app.use('/api/v1/payment', paymentrouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
