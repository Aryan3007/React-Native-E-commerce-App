import { Category, Subcategory } from "../models/Category.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Variation from "../models/Variation.js";


export const addProduct = async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    console.log("Received files:", req.files);

    const {
      name,
      description,
      baseprice,
      category,
      subcategory, // Include subcategory
      features = [],
      variations = [],
    } = req.body;

    // Parse features and variations from strings to objects
    const parsedFeatures =
      typeof features === "string" ? JSON.parse(features) : features;
    const parsedVariations =
      typeof variations === "string" ? JSON.parse(variations) : variations;

    // Validate required fields
    if (!name || !description || !category || !baseprice) {
      return res.status(400).json({
        message: "Name, description, baseprice, and category are required.",
      });
    }

    // Extract user ID from the authenticated token
    const userId = req.user.userId;

    // Find the user in the database and ensure they have a store
    const user = await User.findById(userId).populate("store");
    if (!user || !user.store) {
      return res.status(403).json({
        message: "Store not found",
      });
    }

    // Validate category and subcategory
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: "Category not found." });
    }

    const subcategoryDoc = subcategory
      ? await Subcategory.findById(subcategory)
      : null;

    if (subcategory && !subcategoryDoc) {
      return res.status(400).json({ message: "Subcategory not found." });
    }

    // Process uploaded files for main product images
    const mainImages = req.files?.productImages
      ? req.files.productImages.map(
          (file) => `/uploads/${file.filename.replace(/\\/g, "/")}`
        )
      : [];

    // Map variation images based on the provided index
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

    // Create variations in the database and collect their ObjectIds
    const variationIds = [];
    for (let index = 0; index < parsedVariations.length; index++) {
      const variation = parsedVariations[index];
      const newVariation = new Variation({
        name: variation.name,
        price: parseFloat(variation.price),
        stock: parseInt(variation.stock, 10),
        sku: `SKU-${name.replace(/\s+/g, "-").toUpperCase()}-${index + 1}-${Date.now()}`, // Generate unique SKU
        images: variationImagesMap[index] || [],
        attributes: variation.attributes || {}, // Ensure attributes are included
        description: variation.description || '',
        features: variation.features || [], // Include any features for the variation
      });

      const savedVariation = await newVariation.save();
      variationIds.push(savedVariation._id);
    }

    // Create the product
    const newProduct = new Product({
      name,
      description,
      baseprice,
      category,
      subcategory,
      images: mainImages,
      store: user.store._id,
      variations: variationIds, // Store the ObjectId references of the variations
      features: parsedFeatures,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Product added successfully.",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      message: "Error adding product.",
      error: error.message,
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
    
    // Populate category, subcategory, variations, and store
    const product = await Product.findById(id)
      .populate("category") // Populate category field
      .populate("subcategory") // Populate subcategory field
      .populate("variations") // Populate variations field with full info
      .populate("store"); // Populate store field with full info

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json(product); // Send the populated product details
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
