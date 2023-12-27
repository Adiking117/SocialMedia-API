import {Blog} from "../models/blog.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { User } from "../models/user.models.js"

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

    const { title,description,postname,username } = req.body;
    if(!(title && description && postname && username)){
        throw new ApiError(401,"Please provide details")
    }

    const user = await User.findOne({username})

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
        postname,
        title,
        description,
        image: image.url,
        user:user._id
    })

    const createdBlog = Blog.findById(blog._id)

    if(!createdBlog){
        throw new ApiError(500,"Something went wrong while uploading")
    }

    await User.findByIdAndUpdate(
        user._id,
        { $push: { blogs: blog._id } },
        { new: true }
    );

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

const likeBlog = asyncHandler(async(req,res)=>{
    const {postname,username} = req.body
    if(!(postname && username)){
        throw new ApiError(400,"Please provide details")
    }

    const user = await User.findOne({username})
    const post = await Blog.findOne({postname})

    if(!(post && user)){
        throw new ApiError(400,"Blog not dound")
    }

    await post.addLike(user.username)

    return res
    .status(200)
    .json(
        new ApiResponse(200,post.likes.length,"Liked the post")
    )
})

const dislikeBlog = asyncHandler(async(req,res)=>{
    const {postname,username} = req.body
    if(!(postname && username)){
        throw new ApiError(400,"Please provide details")
    }

    const user = await User.findOne({username})
    const post = await Blog.findOne({postname})

    if(!(post && user)){
        throw new ApiError(400,"Blog not dound")
    }

    await post.removeLike(user.username)

    return res
    .status(200)
    .json(
        new ApiResponse(200,post.likes.length,"Disliked the post")
    )
})

export{
    getAllBlog,
    addBlog,
    updateBlog,
    likeBlog,
    dislikeBlog
}