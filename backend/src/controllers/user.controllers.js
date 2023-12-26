import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const getAllUser = asyncHandler(async(req,res)=>{
    const user = await User.find()
    // console.log(user)
    
    if(user.length === 0){
        throw new ApiError(404,"USer not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Users fetched successfully")
    )
})

const registerUser = asyncHandler(async(req,res)=>{
    const { name,email,password } = req.body;
    if(!(name && email && password)){
        throw new ApiError(401,"Fill all the details")
    }
    const existedUser = await User.findOne({email})
    if(existedUser){
        throw new ApiError(402,"User Already exist")
    }
    const user = await User.create({
        name,
        email,
        password
    })
    const newuser = await User.findById(user._id).select("-password")
    if(!newuser){
        throw new ApiError(500,"Something went worng")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,newuser,"User Created Successfully")
    )
})

export {
    getAllUser,
    registerUser
}