const mongoose = require("mongoose");
const contectusSchema = new mongoose.Schema(
  {
    profileName: String,
    profileEmail: String,
    name: String,
    email: String,
    subject: String,
    message: String,
  },
  {
    timestamps: true,
  }
);
const Contectus = mongoose.model("Contectus", contectusSchema);
export default Contectus;
