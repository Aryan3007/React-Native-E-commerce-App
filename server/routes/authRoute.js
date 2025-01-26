import express from "express";
import {  getUserByToken, loginUser, registerUser, updateUserAddress } from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)
authRouter.get('/user/',isAuthenticated, getUserByToken)
authRouter.put('/user/:userId/address', updateUserAddress)
export default authRouter;
