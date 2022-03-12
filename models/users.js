import mongoose, { mongo, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { regions, role } from "../enumerations";

const schema = new Schema(
  {
    name: String,
    email: String,
    password: String,
    demo: { type: Boolean },
    isVerified: { type: Boolean, default: false },
    status: String,
    role: {
      type: String,
      enum: Object.values(role),
      default: role.Admin,
    },
    previousPasswords: {
      type: Array,
      default: [],
    },
    signUpAt: Date,
    business: Object,
    address: Object,
    amazonEU: Object,
    amazonUS: Object,
    tenantId: String,
    spapi_oauth_code: String,
    mws_auth_token: String,
    selling_partner_id: String,
    createdBy: { type: mongoose.Types.ObjectId, ref: "Users" },
    parentTenantId: String,
    roleId: { type: mongoose.Types.ObjectId, ref: "roles" },
    refreshToken: String,
    access_token: String,
    token_type: String,
    expires_in: String,
    marketplaceRegion: {
      type: String,
      enum: Object.values(regions),
      default: regions.northAmericaRegion,
    },
    disabled: { type: Boolean, default: false },
    image: String,
    cardAdded: { type: Boolean, default: true },

  },
  { timestamps: true }
);
schema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  user.password = bcrypt.hashSync(this.password, 10);
  return next();
});

schema.pre("updateOne", function (next) {
  const password = this.getUpdate().$set.password;
  let hash;
  if (password) {
    hash = bcrypt.hashSync(password, 10);
    this.getUpdate().$set.password = hash;
  }
  next();
});

schema.methods.validatePassword = function (candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};
const Users = mongoose.model("users", schema);

export default Users;
