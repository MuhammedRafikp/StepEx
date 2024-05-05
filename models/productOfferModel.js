import mongoose from "mongoose";

const productOfferSchema = mongoose.Schema({

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    offer: {
        type: Number,
        required: true
    },
    offer_price: {
        type: Number
    },
    validity: {
        type: Date,
        required: true
    }

});

productOfferSchema.index({ validity: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('ProductOffer', productOfferSchema);
