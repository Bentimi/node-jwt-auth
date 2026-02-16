const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        unique: true,
        // default: null,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: null,
    },
    role: {
        type: String,
        enum: ['user', 'staff', 'admin', 'dispatch'],
        default: 'user',
    },
    profile_picture: {
        type: String,
        default: null,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpiry: {
        type: Date,
        default: null,
    },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
})

const User = mongoose.model('User', userSchema);

module.exports = User;