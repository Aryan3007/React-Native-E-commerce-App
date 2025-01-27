import { Category, Subcategory } from "../models/Category.js";


// Add a new category
export const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const newCategory = new Category({
      name,
      description,
    });

    const savedCategory = await newCategory.save();

    res.status(201).json({
      message: "Category created successfully",
      category: savedCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      message: "Error creating category.",
      error: error.message,
    });
  }
};

// Add a new subcategory
export const addSubcategory = async (req, res) => {
  try {
    const { name, categoryId, description } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ message: "Subcategory name and categoryId are required" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const newSubcategory = new Subcategory({
      name,
      category: categoryId,
      description,
    });

    const savedSubcategory = await newSubcategory.save();

    // Add the subcategory to the parent category's subcategories array
    category.subcategories.push(savedSubcategory._id);
    await category.save();

    res.status(201).json({
      message: "Subcategory created successfully",
      subcategory: savedSubcategory,
    });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    res.status(500).json({
      message: "Error creating subcategory.",
      error: error.message,
    });
  }
};


// categoryController.js
// Get all categories with subcategories
export const getCategories = async (req, res) => {
    try {
      const categories = await Category.find().populate('subcategories');
      res.status(200).json({ categories });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Error fetching categories.", error: error.message });
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
