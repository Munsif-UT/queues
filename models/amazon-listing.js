import mongoose, { Schema } from "mongoose";

import mongoTenant from '../utils/mongo-tenant';

const schema = new Schema({
  id: String,
  marketPlaceId: String,
  sku: String,
  asin: String,
  title: String,
  fulfillmentType: String,
  price: Number,
  status: String,
  mfnFulfillableQuantity: Number,
  imageUrl: String,
  ProductGroup: String
},
  { timestamps: true }
);

schema.plugin(mongoTenant);

const AmazonListing = mongoose.model('amazonlistings', schema);

export default AmazonListing;
