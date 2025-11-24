import express from 'express';
import { createUser, loginUser, getUsers, googleLogin } from '../controllers/userController.js';


const userRouter = express.Router()

userRouter.post("/", createUser)
userRouter.post("/login", loginUser)
userRouter.get("/", getUsers)
userRouter.post("/google-login", googleLogin)

export default userRouter