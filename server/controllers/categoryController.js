import Category from "../models/Category.js";
import Subcategory from "../models/Subcategory.js";

// Create a new category
export const createCategory = async (req, res) => {
    const { name, description } = req.body;

    try {
        const category = new Category({ name, description });
        await category.save();
        res.status(201).json({ message: "Category created successfully", category });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all categories
export const getAllCategories = async (req, res) => {
    try {
        // Using aggregation to get categories with product count
        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: "products", // Assuming the collection name for products is 'products'
                    localField: "_id", // Field in the Category collection
                    foreignField: "category", // Field in the Product collection that references the Category
                    as: "products", // Alias for the array of matching products
                },
            },
            {
                $project: {
                    name: 1, // Include category name
                    productCount: { $size: "$products" }, // Count number of products in each category
                },
            },
        ]);
        
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// Update a category
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const category = await Category.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category updated successfully", category });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a category
export const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        await Subcategory.deleteMany({ categoryId: id }); // Delete subcategories first
        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
