import express from "express"
import { getAllUser, registerUser , loginUser, logoutUser, updateUserName, updateUserPassword } from "../controllers/user.controllers.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"
const userRouter = express.Router();

//router.get("/",getAllUser);
userRouter.route("/").get(getAllUser)
userRouter.route("/register").post(registerUser)
userRouter.route("/login").post(loginUser)
userRouter.route("/logout").post(verifyJWT,logoutUser)
userRouter.route("/update-name").patch(verifyJWT,updateUserName)
userRouter.route("/update-password").patch(verifyJWT,updateUserPassword)

export default userRouter;