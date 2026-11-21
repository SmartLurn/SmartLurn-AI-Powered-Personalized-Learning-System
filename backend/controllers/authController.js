import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../models/userModel.js';

export const Login= async(req,res)=>{
    try{

        const { password } = req.body;
        // Phones often capitalise the first letter, so compare emails in lowercase
        const email = req.body?.email?.trim().toLowerCase();

        if(!email || !password){
            return res.status(400).json({message: "Email and password are required"});
        }

        //check if user exists
        const user= await findUserByEmail(email);

        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        //check if password is correct
        const isMatch= await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({message: "Invalid credentials"});
        }

        const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
       
       return res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        token: token
      });

    }

    catch(error){
        console.log("Login error:", error);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

export const Register= async(req,res)=>{
    try{
    const { name, password } = req.body;
    // Save emails in lowercase so login works however the email is typed
    const email = req.body?.email?.trim().toLowerCase();
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    //check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser(name, email, hashedPassword);

    //Generate JWT token

    const token=jwt.sign({id:newUser.id},
         process.env.JWT_SECRET, 
         { expiresIn: '7d' });

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
      token: token
    });

}
catch(error){
    console.log("Register error:", error);
    return res.status(500).json({message: 'Internal Server Error'});
}

}