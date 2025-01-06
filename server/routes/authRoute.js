import express from "express";
import { getUserById, loginUser, registerUser } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)
authRouter.get('/user/:id', getUserById)
export default authRouter;
