import mongoose, { Schema } from "mongoose";
import { role } from "../enumerations";
import mongoTenant from "../utils/mongo-tenant";

const options = { timestamps: true };

const schema = new Schema(
  {
    name: { type: String, required: true },
    activities: [{ type: String, required: true }],
    default: { type: Boolean, required: true, default: false },
    modules: [{ type: String, required: true }],
    role: { type: String, enum: Object.values(role) },
    disabled: { type: Boolean, default: false },
  },
  options
);

schema.plugin(mongoTenant);

const Roles = mongoose.model("roles", schema);

export default Roles;
