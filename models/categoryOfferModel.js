import mongoose from "mongoose";

const categoryOfferSchema = mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required:true
    },
    offer: {
        type: Number,
        required:true
    },
    validity: {
        type: Date,
        required:true
    }
});

categoryOfferSchema.index({ validity: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('CategoryOffer', categoryOfferSchema);
