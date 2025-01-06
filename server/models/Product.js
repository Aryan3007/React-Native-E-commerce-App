import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Category", // Reference to the Category model
        required: true 
    },
    images: [{ type: String, required: true }],
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    ratings: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            rating: { type: Number, required: true },
            comment: { type: String },
        },
    ],
    averageRating: { type: Number, default: 0 },
});

export default mongoose.model("Product", ProductSchema);
