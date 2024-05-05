import mongoose from "mongoose";

const otpSchema = mongoose.Schema({
    email: {
        type: String,

    },
    OTP: {
        type: Number,

    },
     expireAt: {
        type: Date,
        default: Date.now,
        expires: 25,
    }
})
otpSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("OTP", otpSchema);