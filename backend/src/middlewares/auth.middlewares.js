import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async(req,_,next) =>{ // '_' becoz res not used anywhere
    try {
        
        // console.log("reqcookiesaccesss : ",req.cookies.accessToken)
        const token = req.cookies?.accessToken || 
        req.header("Authorization")?.replace("Bearer ","")
        // console.log("token : ",token)

        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        // console.log("decodedtoken : ",decodedToken)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        // console.log("user : ",user)

        if(!user){
            throw new ApiError(401,"Invalid Access token")
        }
    
        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid ACcess token")
    }

})