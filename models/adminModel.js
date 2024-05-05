import mongoose from "mongoose";
import ObjectId from "mongodb";

const adminSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_admin:{
        type:Number,
        required:true
    }
})

export default mongoose.model("Admin", adminSchema);