import mongoose from "mongoose";
import { channels } from "../enumerations/index.js";
import stockTrackInitialArray from "../utils/stockTrackInitialArray.js";

const options = { timestamps: true,  strict: true,
  strictQuery: false };

const schema = new mongoose.Schema(
  {
    image: String,
    name: String,
    status: String,
    category: String,
    taxable: Boolean,
    requires_shipping: Boolean,
    channel: { type: String, enum: Object.values(channels) },
    brands: [{ type: mongoose.Types.ObjectId, ref: "brands" }],
    storeId: { type: mongoose.Types.ObjectId, ref: "stores" },
    underStockTrack:{
      type:[{
        count:Number,
        date:Date
      }],
      default:stockTrackInitialArray
    },
    overStockTrack:{
      type:[{
        count:Number,
        date:Date
      }],
      default:stockTrackInitialArray
    },
    upc: String,
    partNumber: String,
    descriptionForPO: String,
    groupByRegion: [
      {
        name: String,
        active: Boolean,
      },
    ],
    leadTimes: [
      {
        warehouseId: { type: mongoose.Types.ObjectId, ref: "warehouses" },
        leadTime: { type: Number, default: 0 },
      },
    ],
    retailPricingAndSku: [
      {
        marketplace: String,
        marketplaceId: { type: mongoose.Types.ObjectId, ref: "marketplaces" },
        sku: String,
        asin: String,
        fnsku: String,
        price: Number,
        quantity: Number,
      },
    ],
    calculationVariables: {
      velocityDurations: {
        type: Array,
        default: [
          "twoDays",
          "sevenDays",
          "fifteenDays",
          "thirtyDays",
          "sixtyDays",
          "ninetyDays",
          "oneEightyDays",
        ],
        required: true
      },
      snoozeUntil: Date,
      snooze: Boolean,
      isPurchaseOrderCreated: {
        type: Boolean,
        default: false,
        required: true
      },
      orderSchedule: Number,
      maxStock: Number,
      warehouseMaxStock: Number,
      moq: Number,
      packagingInfo: Number,
      additionalGrowthRate: Number,
      // --> mun
      orderFrequency: {
        type: Number,
        default: 0,
        required: true
      },
      startDate: Date,
      RadioInStockOrUnits: String,
      fbaBufferStockMin: {
        type: Number,
        default: 61,
        required: true
      },
      fbaMaxStock: {
        type: Number,
        default: 100,
        required: true
      },
      warehouseBufferStockMIn: Number,
      warehouseMaxStock: Number,
    },
    dimensionsAndSpecs: {
      unitsPerCarton: Number,
      cartonsPerPallet: Number,
      palletsPerCarton: Number,
      imperial: Boolean,
      metric: Boolean,
      unit: { height: Number, length: Number, width: Number, weight: Number },
      carton: { height: Number, length: Number, width: Number, weight: Number },
    },
    supplierPricing: {
      bundleProduct: Boolean,
      products: [
        {
          productId: { type: mongoose.Types.ObjectId, ref: "masterListings" },
          units: Number,
        },
      ],
      suppliers: [
        {
          primary: Boolean,
          supplierId: { type: mongoose.Types.ObjectId, ref: "vendors" },
          manufacturerPartNumber: String,
          costPerUnit: Number,
          shippingCost: Number,
          moq: Number,
        },
      ],
    },
    notes: [{ text: String, createdAt: Date }],
    freightForwarder: {
      type: [{ type: mongoose.Types.ObjectId, ref: "vendors" }],
      default: [],
    },
    prepCenter: {
      type: [{ type: mongoose.Types.ObjectId, ref: "vendors" }],
      default: [],
    },
    parent: mongoose.Types.ObjectId,
    favourite: { type: Boolean, default: false },
    supplyChainTime: [
      {
        supplyChainTimeId: {
          type: mongoose.Types.ObjectId,
          ref: "supplyChainTime",
        },
        supplierId: { type: mongoose.Types.ObjectId, ref: "vendors" },
        marketPlaces: [String],
      },
    ],
    tags: {
      type: [{ type: mongoose.Types.ObjectId, ref: "tags" }],
      default: [],
    },
    table: { type: {}, default: {} },
    velocity: {
      type: {
        type: String,
        enum: ["manualVelocity", "velocityCalculation"],
        default: "velocityCalculation",
        required: true,
      },
      manualVelocity: { type: Number, default: 0 },
    },
    synced: Boolean,
    listingId: String,
    openDate: String,
    imageUrl: String,
    itemIsMarketplace: String,
    productIdType: String,
    zShopShippingFee: String,
    itemCondition: String,
    zshopCategory1: String,
    zshopBrowsePath: String,
    zshopStorefrontFeature: String,
    asin1: String,
    asin2: String,
    asin3: String,
    willShipInternationally: String,
    expeditedShipping: String,
    zshopBoldface: String,
    productId: String,
    bidForFeaturedPlacement: String,
    addDelete: String,
    pendingQuantity: String,
    fulfillmentChannel: String,
    merchantShippingGroup: String,
    mfnListingExists: String,
    mfnFulfillableQuantity: String,
    afnListingExists: String,
    afnWarehouseQuantity: String,
    afnFulfillableQuantity: String,
    afnUnsellableQuantity: String,
    afnReservedQuantity: String,
    afnTotalQuantity: String,
    perUnitVolume: String,
    afnInboundWorkingQuantity: String,
    afnInboundShippedQuantity: String,
    afnInboundReceivingQuantity: String,
    afnResearchingQuantity: String,
    reserved_fcTransfers: String,
    reserved_fcProcessing: String,
    brand: String,
    color: String,
    itemDimensions: String,
    model: String,
    packageDimensions: String,
    packageQuantity: String,
    partNumber: String,
    productGroup: String,
    productTypeName: String,
    salesRankings: [{ ProductCategoryId: String, Rank: Number }],
    materialType: [String],
    itemDimensions: {
      Height: { value: Number, Units: String },
      Length: { value: Number, Units: String },
      Width: { value: Number, Units: String },
      Weight: { value: Number, Units: String },
    },
    packageDimensions: {
      Height: { value: Number, Units: String },
      Length: { value: Number, Units: String },
      Width: { value: Number, Units: String },
      Weight: { value: Number, Units: String },
    },
    smallImage: {
      URL: String,
      Height: { Units: String, value: Number },
      Width: { Units: String, value: Number },
    },
  },
  options
);

schema.virtual("child", {
  ref: "masterListings",
  localField: "_id",
  foreignField: "parent",
});

// schema.pre(/^find/, function (next) {
//   this.populate({
//     path: "supplierPricing.suppliers.supplierId",
//     select: "name officeAddress primaryContact",
//   });
//   next();
// });

schema.virtual("inventoryLevels", {
  ref: "warehousequantities",
  localField: "_id",
  foreignField: "mlid",
});

schema.set("toJSON", { virtuals: true });

// schema.plugin(mongoTenant);

const masterListings = mongoose.model("masterListings", schema);

export default masterListings;
