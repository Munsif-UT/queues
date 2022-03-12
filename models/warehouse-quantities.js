import mongoose from 'mongoose';



const options = { timestamps: true ,  strict: true,
  strictQuery: false};

const schema = new mongoose.Schema(
  {
    mlid: mongoose.Types.ObjectId,
    wid: { type: mongoose.Types.ObjectId, ref: 'warehouse' },
    price: Number,
    quantity: Number,
  },
  options
);

// schema.plugin(mongoTenant);

const WarehouseQuantities = mongoose.model('warehousequantities', schema);

export default WarehouseQuantities;
