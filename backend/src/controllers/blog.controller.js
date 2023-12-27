import {Blog} from "../models/blog.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const getAllBlog = asyncHandler(async(req,res)=>{
    const blog = await Blog.find();
    if(blog.length === 0){
        throw new ApiError(404,"Blogs not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,blog,"Blogs fetched successfully")
    )
})

const addBlog = asyncHandler(async(req,res)=>{
    // console.log(req.body)
    // console.log(req.files)

    const { title,description } = req.body;
    if(!(title && description)){
        throw new ApiError(401,"Please provide details")
    }

    const imageLocalPath = req.files?.image[0]?.path
    // console.log(imageLocalPath)
    if(!imageLocalPath){
        throw new ApiError(400,"Image path not found")
    }

    const image = await uploadOnCloudinary(imageLocalPath)
    if(!image){
        throw new ApiError(400,"Image required")
    }

    const blog = await Blog.create({
        title,
        description,
        image: image.url
    })

    const createdBlog = Blog.findById(blog._id)

    if(!createdBlog){
        throw new ApiError(500,"Something went wrong while uploading")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,createdBlog,"Blog Created Successfully")
    )
    
})

const updateBlog = asyncHandler(async(req,res)=>{
    const { title,description } = req.body
    if(!(title || description)){
        throw new ApiError(401,"Please provide title to be updated")
    }

    const updatedblog = await Blog.findOneAndUpdate(
        {title,description},
        {
            $set:{
                title:title,
                description:description
            }
        },
        {
            new:true
        }
    )
    console.log(updatedblog)

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedblog,"Blog updated successfully")
    )
})

export{
    getAllBlog,
    addBlog,
    updateBlog
}