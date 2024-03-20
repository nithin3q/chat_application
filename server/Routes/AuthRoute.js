import express from "express"
import { loginUser, registerUser, logoutUser} from "../Controllers/AuthController.js"
const router=express.Router()
router.post('/register',registerUser)
router.post('/login',loginUser)
router.post('/logout',logoutUser)

export default router