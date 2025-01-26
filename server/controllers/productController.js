import Product from "../models/Product.js";
import User from "../models/User.js";

export const addProduct = async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    console.log("Received files:", req.files);

    const {
      name,
      description,
      price,
      stock,
      category,
      features = [],
      variations = [],
    } = req.body;

    // Parse features and variations from strings to objects
    const parsedFeatures =
      typeof features === "string" ? JSON.parse(features) : features;
    const parsedVariations =
      typeof variations === "string" ? JSON.parse(variations) : variations;

    // Validate required fields
    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Process uploaded files
    const mainImages = req.files?.productImages
      ? req.files.productImages.map(
          (file) => `/uploads/${file.filename.replace(/\\/g, "/")}`
        )
      : [];

    const variationImagesMap = {};
    if (req.files?.variationImages) {
      req.files.variationImages.forEach((file) => {
        const match = file.originalname.match(/variation-(\d+)/); // Match variation index
        if (match) {
          const index = Number(match[1]);
          if (!variationImagesMap[index]) {
            variationImagesMap[index] = [];
          }
          variationImagesMap[index].push(
            `/uploads/${file.filename.replace(/\\/g, "/")}`
          );
        }
      });
    }

    // Assign images to variations
    const processedVariations = parsedVariations.map((variation, index) => ({
      ...variation,
      images: variationImagesMap[index] || [],
    }));

    // Extract user ID from the authenticated token
    const userId = req.user.userId;

    // Find the user in the database
    const user = await User.findById(userId).populate("store");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure the user has a store
    const store = user.store;
    if (!store) {
      return res
        .status(403)
        .json({ message: "You must create a store before adding products." });
    }

    // Create a new product with optional variations and features
    const newProduct = new Product({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      images: mainImages,
      store: store._id,
      variations:
        processedVariations.length > 0 ? processedVariations : undefined,
      features: parsedFeatures,
    });

    const savedProduct = await newProduct.save();

    // Add the product to the store's product list
    store.products.push(savedProduct._id);
    await store.save();

    res.status(201).json({
      message: "Product added successfully.",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      message: "Error adding product.",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get all products with filtering, sorting, and pagination
export const getAllProducts = async (req, res) => {
  try {
    const { category, priceRange, sortBy, page = 1, limit = 10 } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (priceRange) {
      const [min, max] = priceRange.split("-");
      filters.price = { $gte: Number(min), $lte: Number(max) };
    }

    const sortOptions = {};
    if (sortBy === "price") sortOptions.price = 1; // Ascending
    if (sortBy === "-price") sortOptions.price = -1; // Descending

    // Populate the category field with full category data
    const products = await Product.find(filters)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("category"); // Populate category field

    const total = await Product.countDocuments(filters);

    res.status(200).json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products.", error });
  }
};

// Get products by keyword with filtering, sorting, and pagination
export const getProductsByKeyword = async (req, res) => {
  try {
    const {
      keyword,
      category,
      priceRange,
      sortBy,
      page = 1,
      limit = 10,
    } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (priceRange) {
      const [min, max] = priceRange.split("-");
      filters.price = { $gte: Number(min), $lte: Number(max) };
    }
    if (keyword) {
      // Add case-insensitive regex search for the keyword
      filters.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    const sortOptions = {};
    if (sortBy === "price") sortOptions.price = 1; // Ascending
    if (sortBy === "-price") sortOptions.price = -1; // Descending

    const products = await Product.find(filters)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(filters);

    res.status(200).json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products.", error });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { category, priceRange, sortBy, page = 1, limit = 10 } = req.query;

    // Filter for category
    const filters = { category };

    // Filter for price range if provided
    if (priceRange) {
      const [min, max] = priceRange.split("-");
      filters.price = { $gte: Number(min), $lte: Number(max) };
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === "price") sortOptions.price = 1; // Ascending
    if (sortBy === "-price") sortOptions.price = -1; // Descending

    // Fetch products based on category and other filters
    const products = await Product.find(filters)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("category"); // Populate the category field

    // Count the total number of products
    const total = await Product.countDocuments(filters);

    res.status(200).json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products by category.", error });
  }
};

// Get product details by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category"); // Populate the category field

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product details.", error });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params; // Product ID
    const updates = req.body;

    // Extract user ID from the authenticated token
    const userId = req.user.userId;

    // Find the user in the database and ensure they have a store
    const user = await User.findById(userId).populate("store");
    if (!user || !user.store) {
      return res.status(403).json({
        message: "You do not have permission to update this product.",
      });
    }

    // Find the product and check if it belongs to the user's store
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (String(product.store) !== String(user.store._id)) {
      return res
        .status(403)
        .json({ message: "You can only update products in your store." });
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true, // Return the updated document
      runValidators: true, // Enforce schema validation
    }).populate("category"); // Populate the category field

    res.status(200).json({
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product.", error });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params; // Product ID

    // Extract user ID from the authenticated token
    const userId = req.user.userId;

    // Find the user in the database and ensure they have a store
    const user = await User.findById(userId).populate("store");
    if (!user || !user.store) {
      return res.status(403).json({
        message: "You do not have permission to delete this product.",
      });
    }

    // Find the product and check if it belongs to the user's store
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (String(product.store) !== String(user.store._id)) {
      return res
        .status(403)
        .json({ message: "You can only delete products in your store." });
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product.", error });
  }
};

export const addOrUpdateRating = async (req, res) => {
  const { id } = req.params; // Product ID
  const { rating, comment } = req.body;
  const user = await User.findById(req.user.userId); // Get the logged-in user

  if (!user || !rating) {
    return res
      .status(400)
      .json({ message: "User ID and rating are required." });
  }

  try {
    const product = await Product.findById(id); // Find the product by ID
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    console.log("Product ratings:", product.ratings); // Log product ratings for debugging

    // Check if user has already rated the product
    const existingRating = product.ratings.find(
      (rate) => rate.userId && rate.userId.toString() === user._id.toString()
    );

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.comment = comment || existingRating.comment;
    } else {
      // Add new rating
      product.ratings.push({ userId: user._id, rating, comment });
    }

    // Recalculate average rating
    const totalRatings = product.ratings.reduce(
      (acc, curr) => acc + curr.rating,
      0
    );
    product.averageRating = totalRatings / product.ratings.length;

    // Save updated product
    await product.save();

    // Populate user names for ratings
    const populatedProduct = await Product.findById(id).populate({
      path: "ratings.userId",
      select: "name", // Select only the name field
    });

    // Transform the ratings to include user names instead of user IDs
    const ratingsWithUserNames = populatedProduct.ratings.map((rate) => ({
      name: rate.userId?.name || "Unknown User", // Fallback if the user has been deleted
      rating: rate.rating,
      comment: rate.comment,
      _id: rate._id,
    }));

    res.status(200).json({
      message: existingRating
        ? "Rating updated successfully"
        : "Rating added successfully",
      product: {
        ...product.toObject(),
        ratings: ratingsWithUserNames, // Replace ratings with user names
      },
    });
  } catch (error) {
    console.error("Error adding/updating rating:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
