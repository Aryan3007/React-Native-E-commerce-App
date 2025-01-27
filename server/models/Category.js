import mongoose from "mongoose";

// Subcategory Schema
const SubcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // Reference to the parent category
  description: { type: String }, // Optional description for the subcategory
  createdAt: { type: Date, default: Date.now },
});

// Category Schema
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String }, // Optional description for the category
  subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' }], // Array of subcategories
  createdAt: { type: Date, default: Date.now },
});

const Category = mongoose.model('Category', CategorySchema);
const Subcategory = mongoose.model('Subcategory', SubcategorySchema);

export { Category, Subcategory };
