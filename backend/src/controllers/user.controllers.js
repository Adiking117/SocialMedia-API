import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {Blog} from "../models/blog.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { Follow } from "../models/follow.models.js"

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
    const { name,username,email,password } = req.body;
    // console.log(req.body)
    if(!(name && username && email && password)){
        throw new ApiError(401,"Fill all the details")
    }
    const existedUser = await User.findOne({username})
    if(existedUser){
        throw new ApiError(402,"User Already exist")
    }

    const imageLocalPath = req.files?.avatar[0]?.path
    // console.log(imageLocalPath)
    if(!imageLocalPath){
        throw new ApiError(400,"Image path not found")
    }

    const avatar = await uploadOnCloudinary(imageLocalPath)
    if(!avatar){
        throw new ApiError(400,"Image required")
    }
    
    const user = await User.create({
        username,
        name,
        email,
        password,
        avatar: avatar.url
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


const deleteUser = asyncHandler(async(req,res)=>{
    const { email,password } = req.body
    // console.log(req.body)
    const user = await User.findOne({email});
    // const post = await Blog.findOne({user : user._id});

    console.log("user : ",user)
    // console.log("post : ",post)

    const isPasswordCorrect = await user.isPasswordValid(password)
    if(!isPasswordCorrect){
        throw new ApiError(401,"Password is wrong")
    }

    // all blogs of that user gets deleted
    for(const d of user.blogs){
        await Blog.findByIdAndDelete(d)
    }

    // followings to the user gets deleted
    for(const f of user.followings){
        await User.findOneAndUpdate(
            { username : f },
            { $pull : { followers : user.username } }
        )
    }

    // likes given to blogs must get deleted
    for(const l of user.likeHistory){
        await Blog.findOneAndUpdate(
            { _id : l },
            { $pull : { likes : user.username }}
        )
    }

    // user is deleted
    await User.findByIdAndDelete(user._id);

    return res
    .status(200)
    .json(
        new ApiResponse(200,"User deleted Successfully")
    )
})


const followUser = asyncHandler(async(req,res)=>{
    const { userToBeFollowed,follower } = req.body

    // console.log("follower",follower)
    // console.log("UsertobeFollw",userToBeFollowed)

    if(!userToBeFollowed){
        throw new ApiError(402,"User doesn't exists")
    }

    const userWhoIsFollowing = await User.findOne({username: follower})
    const userToFollow = await User.findOne({username: userToBeFollowed})

    // console.log("userwhoisfollwoing",userWhoIsFollowing)
    // console.log("usertofollow",userToFollow)

    if(!userToFollow){
        throw new ApiError(402,"Username didnt matched")
    }
    if(userWhoIsFollowing.followings.includes(userToBeFollowed)){
        throw new ApiError(401,"You already follow that user")
    }

    userWhoIsFollowing.followings.push(userToFollow.username);
    await userWhoIsFollowing.save();

    userToFollow.followers.push(follower)
    await userToFollow.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"User followed Successfully")
    )
})


const unfollowUser = asyncHandler(async(req,res)=>{
    const { userToBeUnfollowed,follower } = req.body
    if(!userToBeUnfollowed){
        throw new ApiError(402,"User doesn't exists")
    }

    const userWhoIsUnfollowing = await User.findOne({username: follower})
    const userToUnfollow = await User.findOne({username: userToBeUnfollowed})

    userWhoIsUnfollowing.followings.pop(userToUnfollow.username);
    await userWhoIsUnfollowing.save();

    userToUnfollow.followers.pop(follower)
    await userToUnfollow.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"User Unfollowed Successfully")
    )
})



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

    const createdBlog = await Blog.findById(blog._id)

    if(!createdBlog){
        throw new ApiError(500,"Something went wrong while uploading")
    }

    console.log("createdBlog  ",createdBlog)

    await User.findByIdAndUpdate(
        user._id,
        { 
            $push: { blogs: blog._id } 
        },
        { new: true }
    );

    return res
    .status(200)
    .json(
        new ApiResponse(200,createdBlog,"Blog Created Successfully")
    )
    
})


const updateBlog = asyncHandler(async(req,res)=>{
    const { postname,title,description } = req.body
    if(!(postname && (title || description))){
        throw new ApiError(401,"Please provide title to be updated")
    }

    const updatedblog = await Blog.findOneAndUpdate(
        {postname},
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


const deleteBlog = asyncHandler(async(req,res)=>{
    const { postname,username } = req.body
    // console.log(req.body)
    if(!(postname && username)){
        throw new ApiError(402,"Please Enter Postname and Username")
    }

    const user = await User.findOne({username})
    const post = await Blog.findOne({postname})
    // console.log("user: ",user)
    // console.log("post: ",post)
    // console.log("userid :",user._id)
    // console.log("postid :",post.user)
   

    if(!(post&&user)){
        throw new ApiError(402,"Not found")
    }

    // if(post.user !== user._id){
    //     throw new ApiError(403,"You cannot delete posts of other user")
    // }

    if (!post.user.equals(user._id)) {
        throw new ApiError(403, "Permission denied: You can only delete your own blogs");
    }

    await User.findByIdAndUpdate(
        user._id,
        {
            $pull : { blogs: post._id},
            //$pull : { }
        },
        {
            new:true
        }
    )
    await Blog.findByIdAndDelete(post._id)
    // await post.findOneAndDelete({postname})




    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Post Deleted SuccessFully")
    )
})


const likeBlog = asyncHandler(async(req,res)=>{
    const {postname,username} = req.body
    if(!(postname && username)){
        throw new ApiError(400,"Please provide details")
    }
    // console.log(username)

    const user = await User.findOne({username})
    const post = await Blog.findOne({postname})

    //console.log("user : ",user)
    //console.log("post : ",post)

    if(!(post && user)){
        throw new ApiError(400,"Blog or username not found")
    }

    await post.addLike(user.username)

    if(!user.likeHistory.includes(post._id)){
        user.likeHistory.push(post._id)
    }
    await user.save();

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
    if(user.likeHistory.includes(post._id)){
        user.likeHistory.pop(post._id)
    }
    await user.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200,post.likes.length,"Disliked the post")
    )
})


const getUserDetails = asyncHandler(async(req,res)=>{
    const {username} = req.body
    if(!username){
        throw new ApiError(401,"Username required")
    }

    const user = await User.findOne({username})
    if(!user){
        throw new ApiError(400,"User not found")
    }

    const userDetails = {
        username : user.username,
        avatar : user.avatar,
        No_of_Post : user.blogs.length,
        No_of_Followers : user.followers.length,
        No_of_Followings : user.followings.length,
        Post : [user.blogs],
        LikeHistory : [user.likeHistory]
    }

    if(!userDetails){
        throw new ApiError(401,"Details not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,userDetails,"Details fetched Successfully")
    )
})


// const getDetailsOfUser = asyncHandler(async(req,res)=>{
//     const {username} = req.body

//     if(!username){
//         throw new ApiError(400,"Please Provide Usernme")
//     }

//     const user = await User.findOne({username})

//     if(!user){
//         throw new ApiError(400,"User not found")
//     }

//     const details = await User.aggregate([
//         {
//             $match:{
//                 _id:user._id
//             }
//         },
//         {
//             $lookup:{
//                 from: "follows",
//                 localField:"_id",
//                 foreignField:"followings",
//                 as:"followers"
//             }
//         },
//         {
//             $lookup:{
//                 from:"follows",
//                 localField:"_id",
//                 foreignField:"followers",
//                 as:"followings"
//             }
//         },
//         {
//             $addFields:{
//                 followers:{
//                     $size : "$followers"
//                 },
//                 followings:{
//                     $size : "$followings"
//                 },
//                 isFollowed:{
//                     $cond:{
//                         if:{$in : [user.id,"$followers.followers"]},
//                         then:true,
//                         else:false
//                     }
//                 }
//             }
//         },
//         {
//             $project:{
//                 username:1,
//                 avatar:1,
//                 followers:1,
//                 followings:1,
//                 isFollowed:1
//             }
//         }
//     ]);

//     console.log("details : ",details)

//     if(!details?.length){
//         throw new ApiError(404,"No Details found")
//     }

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(200,details[0],"User Details fetched successfuly")
//     )
// })
// future scope


const getLikeHistory = asyncHandler(async(req, res) => {
    const {username} = req.body

    if(!username){
        throw new ApiError(400,"Please Provide Usernme")
    }

    const user = await User.findOne({username})

    if(!user){
        throw new ApiError(400,"User not found")
    }

    const like = await User.aggregate([
        {
            $match: {
                _id: user._id
            }
        },
        {
            $lookup: {
                from: "blogs",
                localField: "likeHistory",
                foreignField: "_id",
                as: "likeHistory",
            }
        },
        {
            $project: {
                _id:0,
                likeHistory : 1,
            }
        }
    ]);

    console.log("like ", like);

    return res
        .status(200)
        .json(
            new ApiResponse(200, like[0].likeHistory, "Like History fetched successfully")
        );
});


export {
    getAllUser,
    registerUser,
    loginUser,
    logoutUser,
    updateUserName,
    updateUserPassword,
    deleteUser,
    followUser,
    unfollowUser,
    getAllBlog,
    addBlog,
    updateBlog,
    deleteBlog,
    likeBlog,
    dislikeBlog,
    getUserDetails,
    //getDetailsOfUser,
    getLikeHistory
}