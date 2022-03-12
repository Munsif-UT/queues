import mongoose from 'mongoose';

import  {regions,regionsCode}  from "../enumerations/index.js"

const options = { timestamps: true };

const schema = new mongoose.Schema(
  {
    regionCode: { type: String, enum: Object.values(regionsCode), required: true },
    region: { type: String, enum: Object.values(regions), required: true },
    country: { type: String, required: true },
    countryCode: { type: String, required: true },
    marketplaceId: { type: String, required: true },
  },
  options
);

// schema.plugin(mongoTenant);

const Marketplaces = mongoose.model('marketplaces', schema);

export default Marketplaces;
