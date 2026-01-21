import express from "express"
import { addMessage, getMessages, addReaction } from "../Controllers/MessageController.js"
const router = express.Router()

router.post('/', addMessage)
router.get('/:chatId', getMessages)
router.put('/:messageId/react', addReaction)

export default router
