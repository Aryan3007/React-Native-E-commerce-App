import express from "express";
import { isAuthenticated, isSeller } from "../middlewares/authMiddleware.js";
import { createStore, getStoreProducts, updateStore } from "../controllers/userController.js";


const storeRouter = express.Router();

// Route to create a store
storeRouter.post("/store", isAuthenticated, createStore);
// Route to update store details
storeRouter.put("/store", isAuthenticated, updateStore);
storeRouter.get("/store/:storeId/products", isAuthenticated, getStoreProducts);


export default storeRouter;
