import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    user:{
        type:String,
        required:true
    }
},{timestamps:true})

export const Blog = mongoose.model("Blog",blogSchema)