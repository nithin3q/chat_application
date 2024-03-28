import ChatModel from '../Models/ChatModel.js'
import MessageModel from "../Models/MessageModel.js";
export const addMessages=async(req,res)=>{
    const {chatId,senderId,text}=req.body
    const message=new MessageModel({
        chatId,
        senderId,
        text
        
    });
    try {
        const result = await message.save()
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json(error)
        
    }
}



export const addMessage = async (req, res) => {
    try {
        const { chatId, senderId,receiverId, text } = req.body;

        // Check if a conversation already exists between sender and receiver
        let conversation = await ChatModel.findOne({
            members: { $all: [senderId, receiverId] },
        });

        // If conversation doesn't exist, create a new one
        if (!conversation) {
            conversation = await ChatModel.create({
                members: [senderId, receiverId],
            });
        }

        // Create the message
        const message = new MessageModel({
            chatId,
            senderId,
            text
        });
        // Add the message to the conversation
        // Save both message and conversation
        await Promise.all([message.save(), conversation.save()]);
        // Return the saved message
        res.status(201).json(message);
    } catch (error) {
        console.log("Error in addMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages=async(req,res)=>{
    const{chatId}=req.params
    try {
        const result = await MessageModel.find({chatId})
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json(error)
        
    }
}