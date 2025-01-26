import mongoose from 'mongoose';

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
    images: [{ type: String, required: false }],
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    ratings: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            rating: { type: Number, required: true },
            comment: { type: String },
        },
    ],
    averageRating: { type: Number, default: 0 },

   
    variations: [
        {
            storage: { type: String },  
            color: { type: String },    
            size: { type: String },   
            material: { type: String }, 
            weight: { type: String },   
            style: { type: String }, 
            packaging: { type: String }, 
            engraving: { type: String }, 
            price: { type: Number, required: true }, 
            stock: { type: Number, required: true },
            sku: { type: String },    
            images: [{ type: String }], 
            customOptions: {        
                customMessage: { type: String },  
                customColor: { type: String },  
            },
        }
    ],
    features: [{ type: String }], 
});

export default mongoose.model("Product", ProductSchema);
