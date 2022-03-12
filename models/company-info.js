import mongoose, { Mongoose, Schema } from 'mongoose';

import mongoTenant from '../utils/mongo-tenant';

const options = { timestamps: true };

const schema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'users' },
    image: String,
    businessName: String,
    phone: String,
    website: String,
    orderFrequency: String,
    notes: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    zipCode: String,
    country: String,
    state: String,
  },
  options
);

schema.plugin(mongoTenant);

const brands = mongoose.model('companyInfo', schema);

export default brands;
