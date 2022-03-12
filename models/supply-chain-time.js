import mongoose, { Schema } from 'mongoose';

import mongoTenant from '../utils/mongo-tenant';

const options = { timestamps: true };

const schema = new Schema(
  {
    name: String,
    status: [
      {
        name: String,
        days: Number,
        destination: { type: mongoose.Types.ObjectId, ref: 'warehouse' },
        marketplaceId: String,
      }
    ],
    default: { type: Boolean, default: false },
    isProductSupplyChainTime: { type: Boolean, default: false },
  },
  options
);

schema.plugin(mongoTenant);

schema.virtual('vendorsCount', {
  ref: 'vendors',
  localField: '_id',
  foreignField: 'supplyChainTimeId',
  count: true,
});

schema.virtual('vendors', {
  ref: 'vendors',
  localField: '_id',
  foreignField: 'supplyChainTimeId',
});

schema.set('toJSON', { virtuals: true });

const SupplyChainTime = mongoose.model('supplyChainTime', schema);

export default SupplyChainTime;
