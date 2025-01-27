import User from "../models/User.js";
// Controller to create a store and update user role to seller
import Store from "../models/Store.js";
import Product from "../models/Product.js";

export const createStore = async (req, res) => {
  try {
    const { shopName, address, category } = req.body;

    // Validate required fields
    if (!shopName || !address || !category) {
      return res
        .status(400)
        .json({
          message: "All fields are required: shopName, address, category.",
        });
    }

    // Find the user by ID (from the authenticated user)
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure the user is a buyer before creating a store
    if (user.role !== "buyer") {
      return res.status(403).json({ message: "Your store is already created" });
    }

    // Create a new Store document
    const newStore = new Store({
      shopName,
      address,
      category,
      products: [], // Initialize with an empty products array
    });

    const savedStore = await newStore.save();

    // Update user role to seller and reference the store ID
    user.role = "seller";
    user.store = savedStore._id;

    await user.save();

    res.status(200).json({
      message: "Store created successfully. You are now a seller.",
      store: savedStore,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Controller to update store details
export const updateStore = async (req, res) => {
  try {
    const { shopName, address, category } = req.body;

    // Find the user by ID (from the authenticated user)
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found from updatestore." });
    }

    // Ensure the user is a seller
    if (user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can update store details." });
    }

    // Update the store details
    if (shopName) user.store.shopName = shopName;
    if (address) user.store.address = address;
    if (category) user.store.category = category;

    await user.save();

    res.status(200).json({
      message: "Store updated successfully.",
      store: user.store,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};




export const getStoreProducts = async (req, res) => {
  try {
    const { storeId } = req.params;

    // Find the store by ID and populate its products
    const store = await Store.findById(storeId).populate("products");

    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    // Retrieve all products in the store
    const products = await Product.find({ store: storeId });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found for this store." });
    }


    res.status(200).json({
      message: "Store and products fetched successfully.",
      store: {
        storeName: store.shopName,
        storeDescription: store.description,
        storeLocation: store.location,
        storeContact: store.contact,
        // Include other store details as needed
      },
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
