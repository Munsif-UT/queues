import mongoose, { Schema } from "mongoose";

import mongoTenant from '../utils/mongo-tenant';

const schema = new Schema({
  number: Number,
  warehouseId: String,
  creationDate: Date,
  woDate: Date,
  whatShouldBeDoneWithItems: {
    combineItems: Boolean,
    shipItems: Boolean,
    stockItems: Boolean
  },
  combineItems: [{ type: Schema.Types.ObjectID, ref: "workordercombineitems" }],
  shipItems: [{ type: Schema.Types.ObjectID, ref: "workordershipments" }],
  stockItems: [{
    productId: Schema.Types.ObjectId,
    quantity: Number,
    estArrivalDate: Date
  }],
  notes: String
},
  { timestamps: true }
);

schema.plugin(mongoTenant);

const WorkOrders = mongoose.model('workorders', schema);

export default WorkOrders;
