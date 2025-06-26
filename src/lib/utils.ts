import { Response } from "express";
import jwt from "jsonwebtoken";

export const generateToken = (userId: string, res: Response,password:string) => {
    const token = jwt.sign({ userId,password }, process.env.JWT_SECRET as string, {
        expiresIn: '3d'
    })

    res.cookie('jwt', token, {
        maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production' || process.env.NODE_ENV !== 'development' // Use secure cookies in production
    })

    return token;

}