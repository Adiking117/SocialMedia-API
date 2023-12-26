import express from "express"
import { getAllUser } from "../controllers/user.controllers.js"

const router = express.Router();

//router.get("/",getAllUser);
router.route("/").get(getAllUser)
export default router;