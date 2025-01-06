import express from "express";
import { addOrUpdateRating, addProduct, deleteProduct, getAllProducts, getProductById, getProductsByCategory, getProductsByKeyword, updateProduct } from "../controllers/productController.js";
import { isAuthenticated, isSeller } from "../middlewares/authMiddleware.js";
import multer from "multer";

const productRouter = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Save files in the 'uploads' folder
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  });

  // Multer upload instance
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    },
  });



productRouter.post(
  '/products',
  isAuthenticated,
  upload.array('images', 5), // Allow up to 5 images
  addProduct
);


productRouter.put('/products/:id',isAuthenticated, updateProduct); // Update a product
productRouter.delete('/products/:id',isAuthenticated, deleteProduct); // Delete a product

//for buyer
productRouter.get('/products',isAuthenticated, getAllProducts); // Get all products
productRouter.get('/categoryproducts', getProductsByCategory); // Get all products
productRouter.get('/productbykeyword', getProductsByKeyword); // Get all products
productRouter.get('/products/:id',isAuthenticated, getProductById); // Get a product by ID
productRouter.patch("/products/:id/ratings",isAuthenticated, addOrUpdateRating);

export default productRouter;
