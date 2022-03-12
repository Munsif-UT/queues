import mongoose, { Schema } from "mongoose";
import mongoTenant from '../utils/mongo-tenant';

const schema = new Schema({
  sku: String,
  asin: String,
  manufacturerPartNumber: Number,
  unitsToShip: Number,
  costPerUnits: Number,
  poNumber: Number,
  productId: { type: Schema.Types.ObjectID, ref: "masterListings" }
},
  { timestamps: true }
);

schema.plugin(mongoTenant);

const PurchaseOrderShipmentItems = mongoose.model('purchaseordershipmentitems', schema);

export default PurchaseOrderShipmentItems;
