import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, "Name is required"],
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
      },
      password: {
        type: String,
        required: [true, "Password is required"],
      },
      role: {
        type: String,
        enum: ["buyer", "seller", "admin"],
        default: "buyer", // Default role is buyer
      },
      cart: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
          },
        },
      ],
      wishlist: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
      address: {
        type: String,
      },
      phone: {
        type: String,
      },
      store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
      },
      
    },
    { timestamps: true }
  );
  
  export default mongoose.model("User", userSchema);
  