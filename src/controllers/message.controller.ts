import { Handler } from "express";
import User from "../models/user.model";
import cloudinary from "../lib/cloudinary";
import Message from "../models/message.model";
import { getReceiveSokeetId, io } from "../lib/socketio";

export const getUserForSideBar:Handler=async(req,res):Promise<void>=>{
    try{
        const loggedInUserId=req.user?._id;
        const filterUser = await User.find({_id:{$ne:loggedInUserId}}).select('-password')

        res.status(200).json({
            success:true,
            message:"Users fetched successfully",
            loggedInUserId: loggedInUserId || null,
            users: filterUser
        })
    }catch(err:any){
        res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error: err.message
        })
    }
}


export const getMessages:Handler=async(req,res):Promise<void>=>{
    try{
        const userToChatId=req.params.id;
        const myId=req.user?._id;
        const messages= await Message.find({
            $or:[
                {
                    senderId:myId,
                    receiverId:userToChatId
                },
                {
                    senderId:userToChatId,
                    receiverId:myId
                }
            ]
        })
        res.status(200).json({
            success:true,
            message:"Messages fetched successfully",
            data:messages
        })
    }catch(err:any){
        res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error: err.message
        })
    }
}
export const sendMessage:Handler=async(req,res):Promise<void>=>{
    try{
      const {text,image}=req.body;
      const receiverId=req.params.id;
      const senderId=req.user?._id;
let imageUrl;
if(image){
    const uploadResponse = await cloudinary.uploader.upload(image)
    imageUrl = uploadResponse.secure_url;
}

const newMessage = new Message({
    senderId,
    receiverId,
    text,
    image:imageUrl
})


const storeMessage= await newMessage.save();


// realtime message sending

const receiveSocketId=getReceiveSokeetId(receiverId)

if(receiveSocketId){
    io.to(receiveSocketId).emit('newMessage',newMessage)
}

res.status(200).json({
    success:true,
    message:"Message sent successfully",
    data: storeMessage
})

    }catch(err:any){
        res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error: err.message
        })
    }
}

