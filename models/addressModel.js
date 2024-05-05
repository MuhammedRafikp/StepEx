import mongoose from "mongoose";

const addressSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    address: [
        {
            name: {
                type: String,
                required: true
            },
            street_address: {
                type: String,
                required: true
            },
            place: {
                type: String
            },
            city: {
                type: String
            },
            state: {
                type: String,
                required: true
            },
            mobile: {
                type: String,
                required: true
            },
            pincode: {
                type: Number,
                required: true
            },
            is_default: {
                type: Number,
                default: 0
            }
        }
    ]
})

export default mongoose.model("Address", addressSchema);