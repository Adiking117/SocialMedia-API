import express from "express"
import { getAllUser, registerUser , loginUser } from "../controllers/user.controllers.js"

const router = express.Router();

//router.get("/",getAllUser);
router.route("/").get(getAllUser)
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
export default router;