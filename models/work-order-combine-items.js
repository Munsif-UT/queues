import mongoose, { Schema } from "mongoose";

import mongoTenant from '../utils/mongo-tenant';

const schema = new Schema({
  sku: String,
  quantity: Number,
  itemsToCombine: [{
    sku: String,
    quantityPerFinalProduct: Number,
    total: Number
  }],
  woNumber: Number
},
  { timestamps: true }
);

schema.plugin(mongoTenant);

const WorkOrderCombineItems = mongoose.model('workordercombineitems', schema);

export default WorkOrderCombineItems;
