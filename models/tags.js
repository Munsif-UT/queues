import mongoose, { Schema } from 'mongoose';

import mongoTenant from '../utils/mongo-tenant';

const options = { timestamps: true };

const schema = new Schema(
  {
    productsCount: { type: Number, default: 0 },
    name: String,
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  options
);

schema.plugin(mongoTenant);

const Tags = mongoose.model('tags', schema);

export default Tags;
