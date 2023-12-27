import express from "express"
import { getAllBlog,addBlog, updateBlog } from "../controllers/blog.controller.js"
import { upload } from "../middlewares/multer.middlewares.js"

const blogRouter = express.Router()

blogRouter.route("/").get(getAllBlog)
blogRouter.route("/add").post(
    upload.fields([
        {
            name:"image",
            maxCount: 1
        }
    ]),
    addBlog
)
blogRouter.route("/update-detail").post(updateBlog)


export default blogRouter;