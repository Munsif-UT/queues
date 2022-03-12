import mongoose, { Schema } from "mongoose";

import mongoTenant from '../utils/mongo-tenant';

const schema = new Schema({
  sku: String,
  unitsToShip: Number,
  woNumber: Number
},
  { timestamps: true }
);

schema.plugin(mongoTenant);

const WorkOrderShipmentItems = mongoose.model('workordershipmentitems', schema);

export default WorkOrderShipmentItems;
