import mongoose, { Schema } from 'mongoose';

import mongoTenant from '../utils/mongo-tenant';

const options = { timestamps: true };

const schema = new Schema(
  {
    brandName: String,
    displayName: String,
    status: { type: String, enum: ['active', 'archived'] },
    notes: String
  },
  options
);

schema.plugin(mongoTenant);

const brands = mongoose.model('brands', schema);

export default brands;
