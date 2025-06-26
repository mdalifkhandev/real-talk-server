import { Handler } from 'express';
import User from '../models/user.model';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils';
import cloudinary from '../lib/cloudinary';

export const signupController: Handler = async (req, res): Promise<void> => {
    const { fullName, email, password } = req.body;
    try {

        if (!fullName || !email || !password) {
            res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
            return;
        }

        const user = await User.findOne({ email });

        if (user) {
            res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        if (newUser) {
            generateToken(newUser._id.toString(), res, newUser.password);
            await newUser.save();
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                user: {
                    id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    profilePic: newUser.profilePic,
                },
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'User not created'
            });
        }
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({
            success: false,
            message: 'Error during signup'
        });
    }
};

export const loginController: Handler = async (req, res): Promise<void> => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            res.status(400).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            res.status(400).json({
                success: false,
                message: ' Invalid password '
            })
            return;
        }

        generateToken(user._id.toString(), res, user.password);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
            }
        })



    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const logoutController: Handler = (req, res) => {
    try {
        res.cookie('jwt', '', {
            maxAge: 0, // Clear the cookie
        })
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        })
    } catch (err) {
        console.error('Error during logout:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


export const updateProfileController: Handler = async (req, res): Promise<void> => {
    try {
        const {profilePic} = req.body;
        const userId = req.user?._id;
        console.log(profilePic);



        if (!profilePic) {
            res.status(400).json({
                success: false,
                message: 'Profile picture is required'
            });
            return;
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const uploadUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true })

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: uploadUser
        })
    }
    catch (err) {
        console.log('Error during profile update:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })

    }
}

export const checkAuthController: Handler = (req, res): void => {
    try {
        res.status(200).json({
            success: true,
            message: 'User is authenticated',
            user: req.user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
