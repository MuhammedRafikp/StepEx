import mongoose from "mongoose";

const walletSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    balance: {
        type: Number
    },
    history: [{
        amount: {
            type: Number
        },
        transaction_type: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        },
        previous_balance: {
            type: Number
        }
    }]

});

export default mongoose.model("Wallet", walletSchema);