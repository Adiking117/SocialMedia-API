import express from "express"
import { getAllBlog,addBlog, updateBlog, likeBlog, dislikeBlog, deleteBlog } from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middlewares.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"

const blogRouter = express.Router()

blogRouter.route("/").get(getAllBlog)
blogRouter.route("/add").post(
    verifyJWT,
    upload.fields([
        {
            name:"image",
            maxCount: 5
        }
    ]),
    addBlog
)
blogRouter.route("/update-detail").post(verifyJWT,updateBlog)
blogRouter.route("/delete-blog").post(verifyJWT,deleteBlog)
blogRouter.route("/like-blog").post(verifyJWT,likeBlog)
blogRouter.route("/dislike-blog").post(verifyJWT,dislikeBlog)



export default blogRouter;