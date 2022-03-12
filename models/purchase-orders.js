import mongoose, { Schema } from "mongoose";
import mongoTenant from '../utils/mongo-tenant';
import { poStatuses } from "../enumerations"

const schema = new Schema({
  number: String,
  supplierId: { type: Schema.Types.ObjectID, ref: "vendors" },
  poDate: Date,
  splitShipments: [{ type: Schema.Types.ObjectID, ref: "purchaseordershipments" }],
  includeShippingCost: Boolean,
  paymentTerms: [Object],
  signature: String,
  poStatus: {
    type: String,
    enum: Object.values(poStatuses)
  },
  status: {
    type: String,
    default: 'hide',
    enum: [
      'hide',
      'active',
      'cancel',
      'Draft'
    ]
  },
  notesToSupplier: String,
  notes: [Object],
  emailSent: Date
},
  { timestamps: true }
);

schema.plugin(mongoTenant);

const PurchaseOrders = mongoose.model('purchaseorders', schema);

export default PurchaseOrders;
