import mongoose, { Schema } from 'mongoose';
import io from "socket.io";
import mongoTenant from '../utils/mongo-tenant';
import { notificationsType } from '../utils/notification';
import SocketHelper from './../utils/socketHelper';
import User from './users';
const options = { timestamps: true };

const schema = new Schema(
  {
    title: String,
    desc: String,
    data: Object,
    type: { type: String, enum: ['report', ...Object.values(notificationsType)] },
    read: {
      type: Boolean,
      default: false
    }
  },
  options
);

schema.plugin(mongoTenant);

const Logs = mongoose.model('logs', schema);

Logs.add = async function (
  data
) {
  if (data) {
    let logs = new Logs(data)
    const log = await logs.save();//for current acc
    const user = await User.findOne({ tenantId: log.tenantId }); // fto push notification to parent
    
    if (data.type !== "report") await SocketHelper.pushNotification(data.tenantId, log)
    return { message: "log.added", success: true }
  } else {
    return { message: "error.noRecordstoAdd", success: false }
  }

};

export default Logs;
