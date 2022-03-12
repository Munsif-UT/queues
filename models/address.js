import mongoose, { Schema } from "mongoose";

import mongoTenant from '../utils/mongo-tenant';

const schema = new Schema({
  country: String,
  addressLine1: String,
  city: String,
  state: String,
  zipCode: String
});


schema.plugin(mongoTenant);


schema.plugin(mongoTenant);

const Address = mongoose.model('address', schema);

export default Address;