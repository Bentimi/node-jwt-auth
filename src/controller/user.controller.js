const User = require("../models/user.models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const crypto = require("crypto");


const signup = async (req, res) => {
    const { name, email, password } = req.body;

    try { 
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const newuser = new User({
            name,
            email,
            password: hashedPassword,
        })

        await newuser.save();

        return res.status(201).json({ message: "User created successfully" });
    } catch (e) {
        console.error("Error during signup", e);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });

        if (!user){
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: "user not verified, please verify your account" });
        }

        const comparePassword = await bcrypt.compare(password, user.password);

        if (!comparePassword) {
            return res.status(401).json({ message: "Inalid Credentials" });
        }

        const token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "2h",
        })

        return res.status(200).json({ message: 'Login successful', token });
    } catch (e) {
        console.error('Error during login', e);
        return res.status(500).json({ message: "internal server error" });
    }
}

const getAllUsers = async (req, res) => {
    const { userId } = req.user;

    try {
        const adminuser = await User.findById(userId);
        if (adminuser.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const users = await User.find().select('-password -otp -otpexpiry');
        return res.status(200).json({ users });
    } catch (e) {
        console.error('Error fetching users', e);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { signup, login, getAllUsers };