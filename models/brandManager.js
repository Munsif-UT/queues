import mongoose, { Schema } from "mongoose";

const schema = new Schema({
    email: String,
    randomToken: String,
    isUsed: { type: Boolean, default: false },
    plan: { type: String, enum: ["starter", "growth", "pro", "enterprise"] },
});



const BrandManager = mongoose.model('brandManager', schema);

export default BrandManager;