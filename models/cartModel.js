import mongoose, { Schema } from "mongoose";

const cartSchema=mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    items:[
    {
        products:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true
        },
        quantity: {
            type: Number,
            required:true,
            default: 1,
          }
    }
]
});

export default mongoose.model("Cart",cartSchema);
