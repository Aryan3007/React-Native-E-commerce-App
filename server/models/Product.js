import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Product name
  description: { type: String, required: true }, // Product description
  baseprice: { type: Number, required: true }, // Base price of the product
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  }, // Reference to Category model
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" }, // Optional reference to Subcategory model
  images: [{ type: String }], // Array of image URLs for the main product images
  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, required: true },
      comment: { type: String },
    },
  ],
  averageRating: { type: Number, default: 0 },

  variations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Variation" }], // Array of references to Variation model
  features: [{ type: String }], // Array of features for the product
  store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true }, // Reference to Store model
  createdAt: { type: Date, default: Date.now }, // Date when the product was created
});

export default mongoose.model("Product", ProductSchema);
