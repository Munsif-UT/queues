import mongoose from 'mongoose';
import { warehouseTypes, channels } from "../enumerations/index.js"
const schema = new mongoose.Schema(
  {
    name: String,
    status: String,
    color: String,
    accountNo: String,
    monthlyStorageCostPerPallet: Number,
    primaryContact: Object,
    warehouseAddress: Object,
    factoryAddress: Object,
    officeAddress: Object,
    warehouseMarketplaces: Object,
    warehouseType: { type: String, enum: Object.values(warehouseTypes), required: true, default: "FBA" },
    channel: { type: String, enum: Object.values(channels) },
    marketplaceId: {
      type: mongoose.Types.ObjectId,
      ref: 'marketplaces',
    },
    paymentTerms: [Object],
    supplyChainTimeId: {
      type: mongoose.Types.ObjectId,
      ref: 'supplyChainTime',
    },
    notesForPO: String,
    notesForWO: String,
    notes: [Object],
    supplierBlackOutDate: [Object],
    // products: Number,
    default: {
      type: Boolean,
      default: false,
    },
    supplyChainTime: {
      days: Number,
      name: String,
    },
    products: {
      warehouse: { type: Number, default: 0 }
    },
  },
  { timestamps: true,  strict: true,
    strictQuery: false }
);

// schema.plugin(mongoTenant);

const Warehouse = mongoose.model('warehouse', schema);

export default Warehouse;
