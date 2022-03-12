import mongoose, { Schema } from 'mongoose';

import mongoTenant from '../utils/mongo-tenant';

const options = { timestamps: true };

const schema = new Schema(
  {
    marketplace: String,
    sku: String,
    afnFulfillableQuantity: Number,
    afnInboundWorkingQuantity: Number,
    afnInboundShippedQuantity: Number,
    afnInboundReceivingQuantity: Number,
    afnInboundQuantity: Number,
    afnReservedQuantity: Number,
    afnReservedCustomerOrdersQuantity: Number,
    afnReservedFcProcessingQuantity: Number,
    afnReservedFcTransfers: Number,
    afnReservedFcProcessingDays: Number
  },
  options
);

schema.plugin(mongoTenant);

const WarehouseQuantities = mongoose.model('warehousequantities', schema);

export default WarehouseQuantities;
