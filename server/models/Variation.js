import mongoose from 'mongoose';

const VariationSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Variation name (e.g., "Red - Medium" or "128GB - Black")
  images: [{ type: String, required: true }], // Array of image URLs for the variation
  price: { type: Number, required: true }, // Price for the variation
  stock: { type: Number, required: true, default: 0 }, // Stock quantity for the variation
  sku: { type: String, required: true }, // SKU for the variation
  attributes: { type: Map, of: String, required: true }, // Dynamic attributes (e.g., size, color, storage)
  description: { type: String, required: false }, // Optional description for the variation
  features: [{ type: String }], // Array of features for the variation (e.g., "Waterproof", "Scratch Resistant")
});

export default mongoose.model('Variation', VariationSchema);
