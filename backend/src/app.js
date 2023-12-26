import express from "express"
import dotenv from 'dotenv';
import connectDB from "./db/index.js";

dotenv.config({
    path : './.env'
})
const app = express();

const port = process.env.port || 5000;
connectDB().then(()=>{
    app.listen(port,()=>{
        console.log(`Server is running on ${port}`)
    })
}).catch((error)=>{
    console.log("Connection error : ",error)
})






