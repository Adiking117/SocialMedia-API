import express from "express"
import { getAllUser, registerUser , loginUser, logoutUser, updateUserName, updateUserPassword, deleteUser, followUser, unfollowUser, getUserDetails, getLikeHistory } from "../controllers/user.controllers.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { upload } from "../middlewares/multer.middlewares.js"

const userRouter = express.Router();

//router.get("/",getAllUser);
userRouter.route("/").get(getAllUser)
userRouter.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        }
    ]),
    registerUser
)
userRouter.route("/login").post(loginUser)
userRouter.route("/logout").post(verifyJWT,logoutUser)
userRouter.route("/update-name").patch(verifyJWT,updateUserName)
userRouter.route("/update-password").patch(verifyJWT,updateUserPassword)
userRouter.route("/delete-user").delete(verifyJWT,deleteUser)

userRouter.route("/follow").post(verifyJWT,followUser)
userRouter.route("/unfollow").post(verifyJWT,unfollowUser)

userRouter.route("/get-user").get(verifyJWT,getUserDetails)
userRouter.route("/like-history").get(verifyJWT,getLikeHistory)


export default userRouter;