import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateUserAccessRefreshToken = async function(userid){
    try {
        const user = await User.findById(userid);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
    
        user.refreshToken = refreshToken;
    
        await user.save({validation:false})
        return { accessToken,refreshToken }
    } catch (error) {
        throw new ApiError(500,error)
    }
}


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


const loginUser = asyncHandler(async(req,res)=>{
    // console.log(req.body) // input provided in postman
    const {email,password} = req.body
    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(401,"User doesnt exist")
    }

    const isPasswordCorrect = await user.isPasswordValid(password)
    if(!isPasswordCorrect){
        throw new ApiError(201,"Incorrect Password")
    }

    const { accessToken,refreshToken } = await generateUserAccessRefreshToken(user._id)

    const loggedinUser = await User.findById(user._id)
    .select("-password -refreshToken")

    const options = {       // modifible by server
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            loggedinUser : loggedinUser ,accessToken,refreshToken
        },"User logged IN Successfully")
    )
})


const logoutUser = asyncHandler(async(req,res)=>{
    const {email}= req.body
    await User.findOneAndUpdate(
        {email},
        {
            $set:{
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {       
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User logged Out")
    )

})


const updateUserName = asyncHandler(async(req,res)=>{
    const {email,name} = req.body;

    // console.log(req.body)
    
    if(!(name && email)){
        throw new ApiError(401,"Please provide name to be updated")
    }

    // console.log(req.user)
    const updateduser = await User.findOneAndUpdate(
        {email},
        {
            $set:{
                name:name
            }
        },
        {
            new:true
        }
    )
    // console.log(updateduser)

    return res
    .status(200)
    .json(
        new ApiResponse(200,updateduser,"Username updated successfully")
    )

})


const updateUserPassword = asyncHandler(async(req,res)=>{
    const {email , newPassword , oldPassword } = req.body
    if(!(email && newPassword && oldPassword)){
        throw new ApiError(401,"Enter all details to be updated")
    }
    const user = await User.findOne({email})

    const isPasswordCorrect = await user.isPasswordValid(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400,"Password incorrect")
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave:false })

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Password Updated Successfully")
    )
})

export {
    getAllUser,
    registerUser,
    loginUser,
    logoutUser,
    updateUserName,
    updateUserPassword
}