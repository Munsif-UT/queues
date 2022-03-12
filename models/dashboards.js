import mongoose, { Schema } from 'mongoose';

import mongoTenant from '../utils/mongo-tenant';

const options = { timestamps: true };

const schema = new Schema(
  {
    pageType: String,
    dashboard: String,
    userId: mongoose.Types.ObjectId,
    query: String,
    default: { type: Boolean, default: false },
    favourite: Boolean,
  },
  options
);

schema.plugin(mongoTenant);

const Params = mongoose.model('params', schema);

export default Params;
