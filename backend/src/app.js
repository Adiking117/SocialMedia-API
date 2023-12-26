import express from "express"
import router from "./routes/user.routes.js";
import cors from "cors";
import cookieParser from 'cookie-parser';


const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
}))

app.use(express.json())
app.use(cookieParser())
app.use("/api/users",router)

export default app;





