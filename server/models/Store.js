import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema({
    shopName: { type: String, required: true },
    address: { type: String, required: true },
    category: { type: String, required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // Array of product IDs
});

export default mongoose.model("Store", StoreSchema);
