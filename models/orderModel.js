import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    orderId: {
        type: String,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    discount:{
        type:Number
    },

    items: [
        {
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            name: {
                type: String,
                required: true
            },
            price: {
                type: String,
                required: true
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
            brand: {
                type: String,
                required: true
            },
            imageUrl: {
                type: String,
                required: true
            },
            quantity: {
                type: String,
                required: true,
            },
            status: {
                type: String,
                enum: ["Confirmed", "Shipped", "Cancelled", "Delivered", "Returned"],
                default: "Confirmed",
            },
            reason: {
                type: String

            },
            return_approval: {
                type: Number,
                default: 0
            }
        },
    ],

    address:
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
            type: Number,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },

    },

    date: {
        type: Date,
        default: Date.now
    },
    expected_delivery: {
        type: String,
        default: function () {
            const date = new Date();
            date.setDate(date.getDate() + 4);
            return date;
        }
    },
    payment_method: {
        type: String,
        required: true,
    },
    payment_status: {
        type: String,
        enum: ["Pending", "Success", "Failed"],
        default: "Pending",
    },
},

);

export default mongoose.model("Order", orderSchema);


