import mongoose, { Schema } from 'mongoose';
import mongoTenant from '../utils/mongo-tenant';

const schema = new Schema(
  {
    name: String,
    vendorTypes: [
      {
        type: String,
        enum: [
          'Supplier',
          'Warehouse',
          'Prep Center',
          'Freight Forwarder',
          'Product Inspection',
        ],
      },
    ],
    status: String,
    color: String,
    accountNo: String,
    monthlyStorageCostPerPallet: Number,
    primaryContact: Object,
    warehouseAddress: Object,
    factoryAddress: Object,
    officeAddress: Object,
    warehouseMarketplaces: Object,
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
      supplier: { type: Number, default: 0 },
      warehouse: { type: Number, default: 0 },
      prepCenter: { type: Number, default: 0 },
      freightForwarder: { type: Number, default: 0 },
      productInspection: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

schema.plugin(mongoTenant);

const Vendors = mongoose.model('vendors', schema);

export default Vendors;
