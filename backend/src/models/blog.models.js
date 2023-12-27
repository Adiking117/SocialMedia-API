import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    postname:{
        type:String,
        required:true,
        unique:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    likes:{
        type:Array,
        default:[]
    }
},{timestamps:true})

blogSchema.methods.addLike = async function (username) {
    if (!this.likes.includes(username)) {
        this.likes.push(username);
        await this.save();
    }
};

blogSchema.methods.removeLike = async function (username) {
    if (this.likes.includes(username)) {
        this.likes.pop(username);
        await this.save();
    }
};

export const Blog = mongoose.model("Blog",blogSchema)