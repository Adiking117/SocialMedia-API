import express from "express"
import { getAllBlog } from "../controllers/blog.controller.js"

const blogRouter = express.Router()

blogRouter.route("/").get(getAllBlog)

export default blogRouter;