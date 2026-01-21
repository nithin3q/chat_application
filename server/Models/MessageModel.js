import mongoose from "mongoose";
const MessageSchema = mongoose.Schema({
    chatId: {
        type: String
    },
    senderId: {
        type: String
    },
    text: {
        type: String
    },
    reactions: [{
        userId: String,
        emoji: String
    }],
    replyTo: {
        type: String,
        default: null
    },
    replyToText: {
        type: String,
        default: null
    }
},
    {
        timestamps: true
    })
const MessageModel = mongoose.model("Message", MessageSchema)

export default MessageModel