import mongoose from "mongoose";

const couponSchema = mongoose.Schema({

    coupon_code: {
        type: String,
        required: true
    },
    min_price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    validity: {
        type: Date,
        required: true
    },
    is_active:{
        type:Boolean,
        default:true
    }
});

couponSchema.index({ validity: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Coupon', couponSchema)