import express from "express"
import { getAllUser, registerUser , loginUser } from "../controllers/user.controllers.js"

const userRouter = express.Router();

//router.get("/",getAllUser);
userRouter.route("/").get(getAllUser)
userRouter.route("/register").post(registerUser)
userRouter.route("/login").post(loginUser)
export default userRouter;