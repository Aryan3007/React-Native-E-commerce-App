import Cart from "../models/cart.js";
import Product from "../models/Product.js";

// Controller to add an item to the cart
export const addItemToCart = async (req, res) => {
  try {
    // Extract productId and quantity from the request body
    const { productId, quantity } = req.body;

    // Ensure the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the user already has a cart
    let cart = await Cart.findOne({ userId: req.user.userId }); // Ensure the use of userId in the query

    if (!cart) {
      // If no cart exists for the user, create a new cart
      cart = new Cart({
        userId: req.user.userId, // Automatically set userId to the logged-in user
        items: [{ productId, quantity }],
      });
    } else {
      // If cart exists, check if the product is already in the cart
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );
      if (existingItem) {
        // If the item is already in the cart, update the quantity
        existingItem.quantity += quantity;
      } else {
        // If the item is not in the cart, add it
        cart.items.push({ productId, quantity });
      }
    }

    // Save the updated cart
    await cart.save();

    return res.status(200).json({ message: "Item added to cart successfully", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ message: "Error adding to cart", error });
  }
};

// Controller to fetch the user's cart
export const getCart = async (req, res) => {
  try {
    // Find the cart using userId
    const cart = await Cart.findOne({ userId: req.user.userId }).populate("items.productId");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    return res.status(200).json(cart); // Return the cart
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({ message: "Error fetching cart", error });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  const { itemId } = req.params; // Extract the itemId from the URL parameters
  const { quantity } = req.body; // Extract the new quantity from the request body

  try {
    // Find the cart for the authenticated user
    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the item in the cart by itemId
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Update the quantity of the item
    item.quantity = quantity;

    // Save the cart with the updated item
    await cart.save();

    return res.status(200).json({ message: "Cart item updated", cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating cart item", error });
  }
};
// Remove an item from the cart
export const removeCartItem = async (req, res) => {
  const { itemId } = req.params; // Extract the itemId from the URL parameters

  try {
    // Find the cart for the authenticated user
    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the item in the cart by itemId
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Remove the item using the pull method
    cart.items.pull(itemId); // This will remove the item from the cart

    // Save the updated cart
    await cart.save();

    return res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error removing cart item", error });
  }
};


// Clear all items from the cart
export const clearCart = async (req, res) => {
  try {
    // Find the cart for the authenticated user
    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Clear all items in the cart
    cart.items = [];
    await cart.save();

    return res.status(200).json({ message: "Cart cleared", cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error clearing cart", error });
  }
};
