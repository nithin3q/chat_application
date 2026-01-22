import express from "express"
import { addMessage, getMessages, addReaction, markAsSeen } from "../Controllers/MessageController.js"
const router = express.Router()

router.post('/', addMessage)
router.get('/:chatId', getMessages)
router.put('/:messageId/react', addReaction)
router.put('/:chatId/seen/:viewerId', markAsSeen)

export default router
