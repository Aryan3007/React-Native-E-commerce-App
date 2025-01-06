import Subcategory from "../models/Subcategory.js";

// Create a new subcategory
export const createSubcategory = async (req, res) => {
    const { name, description, categoryId } = req.body;

    try {
        const subcategory = new Subcategory({ name, description, categoryId });
        await subcategory.save();
        res.status(201).json({ message: "Subcategory created successfully", subcategory });
    } catch (error) {
        console.error("Error creating subcategory:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all subcategories for a category
export const getSubcategoriesByCategory = async (req, res) => {
    const { categoryId } = req.params;

    try {
        const subcategories = await Subcategory.find({ categoryId });
        res.status(200).json(subcategories);
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update a subcategory
export const updateSubcategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const subcategory = await Subcategory.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );

        if (!subcategory) {
            return res.status(404).json({ message: "Subcategory not found" });
        }

        res.status(200).json({ message: "Subcategory updated successfully", subcategory });
    } catch (error) {
        console.error("Error updating subcategory:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a subcategory
export const deleteSubcategory = async (req, res) => {
    const { id } = req.params;

    try {
        const subcategory = await Subcategory.findByIdAndDelete(id);

        if (!subcategory) {
            return res.status(404).json({ message: "Subcategory not found" });
        }

        res.status(200).json({ message: "Subcategory deleted successfully" });
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
