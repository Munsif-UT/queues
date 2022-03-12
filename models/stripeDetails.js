import mongoose, { Schema } from 'mongoose';

const options = { timestamps: true };

const schema = new Schema(
    {
        trialPeriod: { type: Number, default: 30 },
        promoCode: { type: String, default: "promo_1K6FlxGe2Ca9hFsHqEAXmSdg" },
        starter: { type: String, default: "starter_1K6FlxGe2Ca9hFsHqEAXmSdg" },
        growth: { type: String, default: "growth_1K6FlxGe2Ca9hFsHqEAXmSdg" },
        pro: { type: String, default: "pro_1K6FlxGe2Ca9hFsHqEAXmSdg" },
        enterprise: { type: String, default: "enterprise_1K6FlxGe2Ca9hFsHqEAXmSdg" },
    },
    options
);

const StripeDetails = mongoose.model('stripeDetail', schema);

export default StripeDetails;