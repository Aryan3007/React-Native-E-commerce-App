import express from "express";
import {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
} from "../controllers/categoryController.js";

const categoryrouter = express.Router();

categoryrouter.post("/", createCategory);
categoryrouter.get("/", getAllCategories);
categoryrouter.put("/:id", updateCategory);
categoryrouter.delete("/:id", deleteCategory);

export default categoryrouter;
