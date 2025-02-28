import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import transporter from "../config/nodeMailer.js";


export const register = async (req,res) => {
    const { name, email, password } = req.body;

    if(!name || !email || !password) {
        return res.json({success:false, msg: 'Please enter all fields' });
    }

    try {
         const existingUser = await userModel.findOne({email});

         if(existingUser){
             return res.json({success: false, msg: 'User already exists'});
         }
        const hashedPassword = await bcrypt.hash(password,10);

        const user = new userModel({name,email,password:hashedPassword});
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})

        res.cookie('token',token ,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000
        });

       // Sending welcome email
       const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: email,
          subject: 'Welcome to Mern Auth',
          text: `Welcome to our application.Your account has been created with email id: ${email}`
        };
         
        await transporter.sendMail(mailOptions);

        return res.json({success: true});

        
    } catch (error) {
        console.log(error);
        res.json({success:false, msg:error.msg})
    }
}

export const login = async (req,res) => {
    const { email, password } = req.body;
    
    if(!email ||!password) {
        return res.json({success: false, msg: 'Please enter all fields' });
    }

    try {

        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, msg: 'User not found'});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.json({success: false, msg: 'Invalid credentials'});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})

        res.cookie('token',token ,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000
        });
        
       return res.json({success: true});

    } catch (error) {
        res.json({success: false, msg:error.msg});
    }
}

export const logout = async (req,res) => {``
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            // maxAge: 7*24*60*60*1000
        });

        return res.json({success:true, msg:'Logged out'})
        
    } catch (error) {
         res.json({success: false, msg: error.msg});
    }
}

export const sendVerifyOtp = async (req,res) => {
    try {
        const {userId} = req.body

        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({success: false, msg: 'Account already verified'});
        }

      const otp =  String(Math.floor(100000 + Math.random() * 900000));

      user.verifyOtp = otp;
      user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

      await user.save();

      const mailOption = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: 'Verify your account',
        text: `Your verification code is: ${otp}`
      }
      
      await transporter.sendMail(mailOption);
      
      return res.json({success: true, msg: 'Verification Code sent on email'});

    } catch (error) {
        res.json({success:false, msg:error.msg})
    }
}

export const verifyEmail = async  (req,res) => {
   const {userId, otp} = req.body;

   if(!userId || !otp) {
    return res.json({success:false, msg:'Missing required details'})
   }

    try {
        const user = await userModel.findById(userId);
        
        if(!user){
            return res.json({success: false, msg: 'User not found'});
        }
        
        if(user.verifyOtp === '' || user.verifyOtp!== otp){
            return res.json({success: false, msg: 'Invalid OTP'});
        }
        
        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success: false, msg: 'OTP expired'}); 
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
         return res.json({success: true, msg: 'Account verified successfully'});
        
    } catch (error) {
         res.json({success: false, msg: error.msg});
    }
}

export const isAuthenticated = (req,res) => {
    try {
        res.json({success: true});
    } catch (error) {
         res.json({success: false, msg: error.msg});
    }
}


export const sendResetOtp = async (req,res) => {
    const {email} = req.body;

    if(!email){
        return res.json({success: false, msg: 'Please enter email'});
    }

    try {
        const user = await userModel.findOne({email});
        
        if(!user){
            return res.json({success: false, msg: 'User not found'});
        }
       
        const otp =  String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        
        await user.save();
  
        const mailOption = {
          from: process.env.SENDER_EMAIL,
          to: user.email,
          subject: 'Password reset Otp',
          text: `Your OTP for resetting password is: ${otp}`
        }
        
        await transporter.sendMail(mailOption);

         return res.json({success: true, msg: 'Reset OTP sent on email'});
        
    } catch (error) {
        return res.json({success: false, msg: error.msg});
    }
}

export const resetPassword = async (req,res) => {
    const {email, otp, newPassword} = req.body;

    if(!email ||!otp ||!newPassword){
        return res.json({success: false, msg: 'Please enter all fields'});
    }

    try {

        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, msg: 'User not found'});
        }
        
        if(user.resetOtp === '' || user.resetOtp!== otp){
            return res.json({success: false, msg: 'Invalid OTP'});
        } 

        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success: false, msg: 'OTP expired'});
        }

         const hashedPassword = await bcrypt.hash(newPassword,10);
         user.password = hashedPassword;
         user.resetOtp = '';
         user.resetOtpExpireAt = 0;
         
         await user.save();

         return res.json({success: true, msg: 'Password reset successfully'});
        
    } catch (error) {
         return res.json({success: false, msg: error.msg});
    }
}