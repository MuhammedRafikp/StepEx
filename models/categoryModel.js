import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    is_delete: {
        type: Number,
        default: 0
    }
})

export default mongoose.model("Category", categorySchema);