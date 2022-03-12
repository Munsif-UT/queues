import mongoose, { Schema } from 'mongoose';

const schema = new Schema(
  {
    name: String,
    email: String,
    phone: String,
    token: String,
    marketplace: String,
    sale: String,
    message: String,
    isTokenUsed: { required: true, default: false, type: Boolean }
  },
  { timestamps: true }
);
const Onboarding = mongoose.model('onboarding', schema);

export default Onboarding;
