import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import authRouth from './routes/auth.route'
import { connectdb } from './lib/db';
import cookieParser from 'cookie-parser';
import { messageRoute } from './routes/message.route';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { app, server } from './lib/socketio';


app.use(express.json());
app.use(fileUpload({
  useTempFiles:true,
  tempFileDir: '/tmp/',
  limits:{
    fileSize:10*1024*1024
  }
}))
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

app.use(express.urlencoded({ extended: true }));


const port = process.env.PORT || 3000;

app.use('/api/auth',authRouth)
app.use('/api/messages',messageRoute)

server.listen(port,()=>{
  console.log(`Server is running on port ${port}`);
  connectdb()
});