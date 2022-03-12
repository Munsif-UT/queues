import mongoose, { Schema } from 'mongoose';
import { regionsCode } from "../enumerations"
import mongoTenant from '../utils/mongo-tenant';

const options = { timestamps: true };

const schema = new Schema(
    {
        shipmentIdentifier: {
            type: String,
            required: true
        },
        shipmentConfirmationType: {
            type: String,
            enum: ['Original', 'Replace'],
            required: true
        },
        shipmentType: {
            type: String,
            enum: ['TruckLoad', 'LessThanTruckLoad', 'SmallParcel'],
        },
        shipmentStructure: {
            type: String,
            enum: ['PalletizedAssortmentCase', 'LooseAssortmentCase', 'PalletOfItems', 'PalletizedStandardCase', 'LooseStandardCase', 'MasterPallet', 'MasterCase'],
        },
        transportationDetails: {
            carrierScac: String,
            carrierShipmentReferenceNumber: String,
            transportationMode: { type: String, enum: ['Road', 'Air', 'Ocean'] },
            billOfLadingNumber: String,
        },
        amazonReferenceNumber: String,
        shipmentConfirmationDate: { type: String, required: true }, //string(date - time) 
        shippedDate: { type: String, required: true }, //string(date - time) 
        estimatedDeliveryDate: { type: String }, //string(date - time) 
        sellingParty: {
            address: {
                name: String,
                addressLine1: String,
                addressLine2: String,
                addressLine3: String,
                city: String,
                country: String,
                district: String,
                stateOrRegion: String,
                postalCode: String,
                countryCode: String,
                phone: String,
            },
            partyId: String,
            taxRegistrationDetails: [{
                taxRegistrationType: { type: String, enum: ['VAT', 'GST'], required: true },
                taxRegistrationNumber: { type: String, required: true },
            }],
        },
    },
    options
);

schema.plugin(mongoTenant);

const ShipmentConfirmations = mongoose.model('shipmentConfirmations', schema);

export default ShipmentConfirmations;
