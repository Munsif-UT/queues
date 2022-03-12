import mongoose, { Schema } from 'mongoose';
import mongoTenant from '../utils/mongo-tenant';
import { taskTypes, taskStatus, reportType } from "../enumerations"

const options = { timestamps: true };

const schema = new Schema(
    {
        taskType: {
            type: String,
            enum: Object.values(taskTypes),
            required: true
        },
        reportType: {
            type: [String],
            enum: Object.values(reportType),
        },
        processingStatus: {
            type: String,
            enum: Object.values(taskStatus),
        },
        marketplaceIds: {
            type: [String],
        },
        reportId: {
            type: Array,
        },
        months: {
            type: Array,
        },
        lastFetched: {
            type: [Date],
        },
        reportDocumentId: {
            type: [String]
        },
        url: {
            type: String
        },
        completed: {
            type: Number
        },
        runningCount: {
            type: Number
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: 'users',
            required: true
        },
    },
    options
);

schema.plugin(mongoTenant);

const Tasks = mongoose.model('tasks', schema);

export default Tasks;
