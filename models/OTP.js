import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email : {
        type: String,
        required: true,
        unique: true
    },
    otp : {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const Otp = mongoose.model("Otp", otpSchema);
export default Otp;