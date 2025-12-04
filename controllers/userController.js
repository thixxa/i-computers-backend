import User from "../models/User.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import axios from "axios"
import nodemailer from "nodemailer"
import Otp from "../models/OTP.js";

dotenv.config()

//configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: "thisandawellage@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

export function createUser(req,res){

    const data = req.body

    const hashedPassword = bcrypt.hashSync(data.password, 10)

    const user = new User({
        email : data.email,
        firstName : data.firstName,
        lastName : data.lastName,
        password : hashedPassword,
    })

    user.save().then(
        ()=>{
            res.json({
                message: "User created successfully"
            })
        }
    )
}

export function loginUser(req,res){

    const email = req.body.email
    const password = req.body.password

    User.find({email : email}).then(
        (users)=>{
            if(users[0] == null){
                res.status(404).json({
                    message: "User not found"
                })
            }else{
                const user = users[0]  
                
                if(user.isBlocked){
                    return  res.status(403).json({
                        message: "Your account has been blocked. Please contact support.",
                    });
                    return;
                }

                const isPasswordCorrect = bcrypt.compareSync(password,user.password)
                
                if(isPasswordCorrect){
                    //encrypt krana kotasa
                    const payload = {
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        isEmailVerified: user.isEmailVerified,
                        image: user.image
                        //me tike thama api encrypt krnn yanne key ekak use krla
                    };

                    //token eka generate krna widiha
                    const token = jwt.sign(payload, process.env.JWT_SECRET, {
                        expiresIn: "150h"
                    })

                    res.json({
                        message: "Login successful",
                        token: token,
                        role: user.role,
                    })
                }else{
                    res.status(401).json({
                        message: "Invalid password",
                    });
                }
            }
        }
    )
}

//user adminda kiyala balana function eka
export function isAdmin(req){
      if(req.user == null){
        return false;
    }
    if(req.user.role != "admin"){
        return false;
    }
    return true;
}

export function getUsers(req,res){
    if(req.user == null){
        return res.status(401).json({
            message : "Unauthorized"
        });
    }

    res.json(req.user);

}

//google login
export async function googleLogin(req,res){
    console.log(req.body.token);
    try{
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",{
            headers: {
                Authorization: `Bearer ${req.body.token}`
            }
        })
        console.log(response.data);
        //check if user already exists
        const user = await User.findOne({email: response.data.email})
        if(user == null){
            const newUser = new User({
                email: response.data.email,
                firstName: response.data.given_name,
                lastName: response.data.family_name,
                isEmailVerified: response.data.email_verified,
                image: response.data.picture,
                password: "123" 
            })
            await newUser.save()
            const payload = {
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
                isEmailVerified: newUser.isEmailVerified,
                image: newUser.image
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "150h"
            })
            res.json({
                message: "Login successful",
                token: token,
                role: newUser.role,
            });

        }else{
            if(user.isBlocked){
                return  res.status(403).json({
                    message: "Your account has been blocked. Please contact support."
                });
                return;
            }    
            //user already exists
            const payload = {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                image: user.image
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "150h"
            })
            res.json({
                message: "Login successful",
                token: token,
                role: user.role,
            });
        }
    }catch(error){
        res.status(500).json({
            message: "Google login failed",
            error: error.message
        })
    }

}

export async function validateOTPAndUpdatePassword(req, res) {

    try {
    const otp = req.body.otp;
    const newPassword = req.body.newPassword;
    const email = req.body.email;

    const otpRecord = await Otp.findOne({ email: email, otp: otp });
    if (!otpRecord) {
        return res.status(400).json({
            message: "Invalid OTP"
        });
    }
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await User.updateOne({ email: email }, { 
        $set: { password: hashedPassword , isEmailVerified: true } 
    });
    await Otp.deleteMany({ email: email });
    res.json({
        message: "Password updated successfully"
    });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update password",
            error: error.message
        });
    }
}

//send OTP to email
export async function sendOTP(req,res) {

    try{
    const email = req.params.email;
    const user = await User.findOne({email: email});
    if(user == null){
        return res.status(404).json({
            message: "User not found"
        })
        return
    }
    //delete existing OTPs for the email
    await Otp.deleteMany({email: email});

    //generate random 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    //save OTP to database
    const newOtp = new Otp({
        email: email,
        otp: otp
    });
    await newOtp.save();

    const message = {
        from: "thisandawellage@gmail.com",
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}` 
    }
    transporter.sendMail(message, (err, info) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to send OTP",
                error: err.message,
            });
        } else {
            return res.json({
                message: "OTP sent successfully",
            });
        }
    });
    }catch(error){
        res.status(500).json({
            message: "Failed to send OTP",
            error: error.message,
        });
    }
}

export async function getAllUsers(req,res){
    if(!isAdmin(req)){
        res.status(403).json({
            message : "Only admin can view all users"
        })
        return
    }
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching users",
            error: error.message
        });
    }
}

//update user status (block/unblock)
export async function updateUserStatus(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "Only admin can update user status"
        });
    }
    const email = req.params.email;

    if(req.user.email === email){
        return res.status(400).json({
            message: "Admin cannot update their own status"
        });
    }
    const isBlocked = req.body.isBlocked;

    try {
        const user = await User.updateOne(
            { email: email },
            { $set: { isBlocked: isBlocked } }
        );
        res.json({
            message: "User status updated successfully"
        });
    }catch (error) {
        return res.status(500).json({
            message: "Error updating user status",
            error: error.message
        });
    }
}