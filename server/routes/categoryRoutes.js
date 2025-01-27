import express from "express";
import {
    updateCategory,
    deleteCategory,
    addCategory,
    addSubcategory,
    getCategories,
} from "../controllers/categoryController.js";

const categoryrouter = express.Router();

categoryrouter.post("/", addCategory);
categoryrouter.post("/subcategory", addSubcategory);
categoryrouter.get("/", getCategories);
categoryrouter.put("/:id", updateCategory);
categoryrouter.delete("/:id", deleteCategory);

export default categoryrouter;
