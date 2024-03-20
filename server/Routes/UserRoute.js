import express from 'express'
import { getAllUsers, getUser } from '../Controllers/UserController.js';

const router = express.Router()

router.get('/:id', getUser);
router.get('/',getAllUsers)


export default router
