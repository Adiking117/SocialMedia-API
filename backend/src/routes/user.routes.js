import express from "express"
import { getAllUser, registerUser } from "../controllers/user.controllers.js"

const router = express.Router();

//router.get("/",getAllUser);
router.route("/").get(getAllUser)
router.route("/register").post(registerUser)
export default router;