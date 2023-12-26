import {v2 as cloudinary} from "cloudinary";
import fs from "fs"     // file system
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadOnCloudinary = async(localFilePath)=>{
    try{

        if(!localFilePath)  return null;
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type : "auto"
        })
        // file has been uploaded sucesfully
        // console.log(response);
        // console.log(response.url);

        // console.log("File is uplaoded on cloudinary");
        fs.unlinkSync(localFilePath)
        return response;

    }catch(error){
        fs.unlinkSync(localFilePath)    // remove the local savedtemporray file as the uplaod op gets failed
        return null;
    }
} 

export {uploadOnCloudinary}