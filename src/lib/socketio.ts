import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        // methods: ["GET", "POST"],
        // credentials: true
    }
})



export function getReceiveSokeetId(userId:string){
    return userSocketMap[userId]
}



//used to store online users
const userSocketMap: Record<string, string> = {}

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    const userId = socket.handshake.query.userId as string
    
    if (userId) {
        userSocketMap[userId] = socket.id
    }
    // send all online users
    io.emit('getOnlineUsers', Object.keys(userSocketMap))

    socket.on('disconnect', () => {
        delete userSocketMap[userId]
        io.emit('getOnlineUsers', Object.keys(userSocketMap))
        console.log(`User disconnected: ${socket.id}`);
    })

})


export { io, app, server }