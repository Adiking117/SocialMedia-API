import express from "express"
import { getAllBlog,addBlog } from "../controllers/blog.controller.js"
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

export default blogRouter;