import mongoose, { Schema } from 'mongoose';

import mongoTenant from '../utils/mongo-tenant';

const options = { timestamps: true };

const schema = new Schema(
  {
    reportType: String,
    data: [Object]
  },
  options
);

schema.plugin(mongoTenant);

const Report = mongoose.model('report', schema);

export default Report;
