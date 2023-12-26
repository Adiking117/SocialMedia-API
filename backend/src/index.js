import express from "express"
import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import app from "./app.js"

dotenv.config({
    path : './.env'
})

app.get("/",(req,res)=>{
    res.send("hi adi")

    //console.log("hi adi")
})

const port = process.env.port || 5000;
connectDB().then(()=>{
    app.listen(port,()=>{
        console.log(`Server is running on ${port}`)
    })
}).catch((error)=>{
    console.log("Connection error : ",error)
})






