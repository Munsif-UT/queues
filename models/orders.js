import mongoose from 'mongoose';
// import mongoTenant from '../utils/mongo-tenant';
// import { channels } from "../enumerations"
const channels = Object.freeze({
    shopify: "Shopify",
    amazon: "Amazon",
    shipStation: "ShipStation",
});

const schema = new mongoose.Schema({
    orderId: String,
    orderNumber: String,
    orderKey: String,
    merchantOrderId: String,
    purchaseDate: String,
    createDate: String,
    paymentDate: String,
    lastUpdatedDate: String,
    orderStatus: String,
    storeId: { type: mongoose.Types.ObjectId, ref: 'stores' },
    fulfillmentChannel: String,
    salesChannel: String,
    orderChannel: String,
    shipServiceLevel: String,
    productName: String,
    sku: String,
    asin: String,
    channel: { type: String, enum: Object.values(channels) },
    itemStatus: String,
    quantity: String,
    items: Array,
    shipTo: Array,
    billTo: Array,
    financial_status: String,
    currency: String,
    itemPrice: String,
    itemTax: String,
    subTotalPrice: String,
    weight: String,
    shippingPrice: String,
    shippingTax: String,
    giftWrapPrice: String,
    giftWrapTax: String,
    itemPromotionDiscount: String,
    shipPromotionDiscount: String,
    shipCity: String,
    shipState: String,
    shipPostalCode: String,
    shipCountry: String,
    promotionIds: String,
    isBusinessOrder: String,
    purchaseOrderNumber: String,
    priceDesignation: String
},
    { timestamps: true }
);

// schema.plugin(mongoTenant);

const Orders = mongoose.model('Orders', schema);

export default Orders;
