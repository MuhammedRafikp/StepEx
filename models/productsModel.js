import mongoose from 'mongoose';

const productsSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    offer_price:{
        type: Number,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    brand:{
        type:String,
        required:true
    },
   
    images: {
        type:[String],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdAt:{
       type:Date,
       default:Date.now
    },
    is_delete: {
        type: Number,
        default: 0
    }
})

export default mongoose.model("Product", productsSchema);