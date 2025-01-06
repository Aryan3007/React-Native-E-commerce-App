import express from "express";
import {
    createSubcategory,
    getSubcategoriesByCategory,
    updateSubcategory,
    deleteSubcategory,
} from "../controllers/subcategoryController.js";

const subCategoryrouter = express.Router();

subCategoryrouter.post("/", createSubcategory);
subCategoryrouter.get("/:categoryId", getSubcategoriesByCategory);
subCategoryrouter.put("/:id", updateSubcategory);
subCategoryrouter.delete("/:id", deleteSubcategory);

export default subCategoryrouter;
