import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String
    },
    referral_code: {
        type: String
    },
    referred_code: {
        type: String
    },
    is_block: {
        type: Number,
        default: 0
    }
})

export default mongoose.model("User", userSchema);