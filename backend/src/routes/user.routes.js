import express from "express"
import { getAllUser, registerUser , loginUser, logoutUser, updateUserName, updateUserPassword, deleteUser, followUser } from "../controllers/user.controllers.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"
const userRouter = express.Router();

//router.get("/",getAllUser);
userRouter.route("/").get(getAllUser)
userRouter.route("/register").post(registerUser)
userRouter.route("/login").post(loginUser)
userRouter.route("/logout").post(verifyJWT,logoutUser)
userRouter.route("/update-name").patch(verifyJWT,updateUserName)
userRouter.route("/update-password").patch(verifyJWT,updateUserPassword)
userRouter.route("/delete-user").delete(verifyJWT,deleteUser)

userRouter.route("/follow").post(verifyJWT,followUser)

export default userRouter;