import mongoose, { Schema } from 'mongoose';
import { tokenTypes } from "../enumerations"
import mongoTenant from '../utils/mongo-tenant';

const options = { timestamps: true };

const schema = new Schema(
    {
        tokenType: {
            type: String,
            enum: Object.values(tokenTypes),
            required: true
        },
        token: {
            type: String,
            required: true
        },
        expiryTime: {
            type: String
        }
    },
    options
);

schema.plugin(mongoTenant);

const Tokens = mongoose.model('tokens', schema);

export default Tokens;
