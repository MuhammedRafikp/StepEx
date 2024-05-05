import mongoose, { Schema } from "mongoose";

const cartSchema=mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    items:[
    {
        product_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true
        }  
    }
]
});

export default mongoose.model("Wishlist",cartSchema);
