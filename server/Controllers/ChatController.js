import ChatModel from '../Models/ChatModel.js'

export const createChatss=async(req,res)=>{
    const newChat=new ChatModel({
        members:[req.body.senderId,req.body.receiverId]
    })
try{
    const result=await newChat.save()
    res.status(200).json(result)
}catch(error){
    res.status(500).json(error)
}
};

export const createChats = async (req, res) => {
    try {
        const {senderId,receiverId} = req.body;
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
        
        // await Promise.all([message.save(), conversation.save()]);
        // Return the saved message
        const result=await newChat.save()
        res.status(200).json(result)
        // res.status(201).json(message);
    } catch (error) {
        console.log("Error in addMessage controller: ", error.result);
        res.status(500).json({ error: "Internal server errors" });
    }
};
export const createChat = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
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
        
        // Return the saved conversation including its _id
        res.status(200).json({ _id: conversation._id, members: conversation.members });
    } catch (error) {
        console.log("Error in createChats controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


const addMessages = async (req, res) => {
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

export const userChats=async(req,res)=>{
    try {
        const chat =await ChatModel.find({
            members:{$in:[req.params.userId]}
        })
        res.status(200).json(chat)
    } catch (error) {
        res.status(500).json(error)
    }
}
export const findChat=async(req,res)=>{
    try {
        const chat =await ChatModel.findOne({
            members:{$all:[req.params.firstId,req.params.secondId]}
        })
        res.status(200).json(chat)

    } catch (error) {
        res.status(500).json(error)
    }
}