import mongoose, { Schema } from "mongoose";

import mongoTenant from '../utils/mongo-tenant';

const options = { timestamps: true };
const schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "users" },
    errName: String,
    errMsg: String,
    errPathName: String,
}, options);


schema.plugin(mongoTenant);

const ErrorLogger = mongoose.model('errorlogger', schema);

export default ErrorLogger;