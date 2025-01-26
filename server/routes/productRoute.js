import express from "express";
import {
  addOrUpdateRating,
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductsByKeyword,
  updateProduct,
} from "../controllers/productController.js";
import { isAuthenticated, isSeller } from "../middlewares/authMiddleware.js";
import multer from "multer";
import upload from "../middlewares/upload.js";

const productRouter = express.Router();

// Add a product (only for sellers)
productRouter.post(
  "/products",
  isAuthenticated,
  upload.fields([
    { name: "productImages", maxCount: 10 },
    { name: "variationImages", maxCount: 50 },
  ]),
  addProduct
);


productRouter.put("/products/:id", isAuthenticated, updateProduct); // Update a product
productRouter.delete("/products/:id", isAuthenticated, deleteProduct); // Delete a product

//for buyer
productRouter.get("/products", isAuthenticated, getAllProducts); // Get all products
productRouter.get("/categoryproducts", getProductsByCategory); // Get all products
productRouter.get("/productbykeyword", getProductsByKeyword); // Get all products
productRouter.get("/products/:id", isAuthenticated, getProductById); // Get a product by ID
productRouter.patch(
  "/products/:id/ratings",
  isAuthenticated,
  addOrUpdateRating
);

export default productRouter;
