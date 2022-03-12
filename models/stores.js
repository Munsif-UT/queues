import mongoose, { Schema } from 'mongoose';
import { regionsCode } from "../enumerations"
import mongoTenant from '../utils/mongo-tenant';

const options = { timestamps: true };

const schema = new Schema(
  {
    name: String,
    region: { type: String, enum: Object.values(regionsCode) },
    type: { type: String, enum: ['Amazon', 'Shopify', 'ShipStation'] },
    sellerId: String,
    userId: { type: mongoose.Types.ObjectId, ref: 'users' },
    data: Object,
    marketplaces: [String],
    isActive: { type: Boolean, required: true, default: false },
    disabled: { type: Boolean, required: true, default: false },
  },
  options
);

schema.plugin(mongoTenant);

const Stores = mongoose.model('stores', schema);

export default Stores;
