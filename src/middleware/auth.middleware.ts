import { Handler, NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';



const protectRoute: Handler = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const token = req.cookies.jwt;
    if (!token) {
      res.status(401).json({
        success: false,
        message: "unauthorized No token provided"
      })
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
    const { userId, password } = decoded as { userId: string, password: string };

    const user = await User.findById(userId)
    if (!user) {
      res.status(401).json({
        success: false,
        message: "unauthorized User not found"
      })
      return;
    }

    const isPasswordMatched = user.password === password;
    if (!isPasswordMatched) {
      res.status(401).json({
        success: false,
        message: "unauthorized Invalid password"
      })
      return;
    }

    const newUser={
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    req.user = newUser

    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "unauthorized"
    })
    return;
  }




}

export default protectRoute;