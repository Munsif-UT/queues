import mongoose, { Schema } from "mongoose";

import mongoTenant from "../utils/mongo-tenant";

const schema = new Schema(
  {
    productsToShip: [
      { type: Schema.Types.ObjectID, ref: "purchaseordershipmentitems" },
    ],
    shippingCost: Number,
    supplyChainTimeId: {
      type: mongoose.Types.ObjectId,
      ref: "supplyChainTime",
    },
    marketPlace: String,
    trackingNo: String,
    receivedQuantity: Number,
    expectedDate: Date,
    destinationWarehouse: { type: Schema.Types.ObjectID, ref: "warehouse" },
    poNumber: {
      type: Number,
    },
    shipBy: Date,
    estArrivalDate: Date,
    shipmentStatus: String,
    destination: String,
    ShipmentStatusValue: String,
    address: String,
  },
  { timestamps: true }
);

schema.plugin(mongoTenant);

const PurchaseOrderShipments = mongoose.model("purchaseordershipments", schema);

export default PurchaseOrderShipments;
