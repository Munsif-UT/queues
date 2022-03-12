import mongoose, { Schema } from 'mongoose';

const options = { timestamps: true };

const schema = new Schema(
    {
        user: { type: mongoose.Types.ObjectId, ref: 'users' },
        stripeCustomerId: String,
        subscriptionId: String,
        planId: String,
        hasTrial: Boolean,
        trailStart: Date,
        trailEnd: Date,
        subscriptionStatus: String,
        subscriptionEndDate: Date,
        nextInvoice: Date,
        couponUser: Boolean,
    },
    options
);

const Stripe = mongoose.model('stripe', schema);

export default Stripe;