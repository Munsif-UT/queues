import mongoose, { Schema } from "mongoose";

import mongoTenant from '../utils/mongo-tenant';

const schema = new Schema({
  productToShip: [String],
  shippingCost: Number,
  supplyChainTimeId: String,
  marketPlace: String,
  trackingNo: Number,
  woNumber: Number
},
  { timestamps: true }
);

schema.plugin(mongoTenant);

const WorkOrderShipments = mongoose.model('workordershipments', schema);

export default WorkOrderShipments;
