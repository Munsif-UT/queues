import { Queue, Worker, Job, QueueScheduler } from 'bullmq';
import SellingPartnerAPI from 'amazon-sp-api';
import path from 'path';
import Marketplaces from '../models/marketplaces.js';
import { marketplaces } from "../constants/marketplaces.js"
import { Console } from 'console';
import Inventory from '../models/master-listing.js';
import Warehouse from '../models/warehouse.js';
import WarehouseQuantities from "../models/warehouse-quantities.js";
import { warehouseTypes, reportType, taskTypes, taskStatus } from "../enumerations/index.js";
import concat from 'lodash/concat.js';
import first from 'lodash/first.js';
import isEmpty from 'lodash/isEmpty.js';
import pickBy from 'lodash/pickBy.js';
import lowerCase from 'lodash/lowerCase.js';
import upperCase from 'lodash/upperCase.js';

const ProcessReports = new Worker('ProcessReports', async (job) => {



    let sellingPartner = new SellingPartnerAPI({
        region: 'na', // The region of the selling partner API endpoint ("eu", "na" or "fe")
        credentials: {
            SELLING_PARTNER_APP_CLIENT_ID: 'amzn1.application-oa2-client.59178859d5084b37921366f54dcad67a',
            SELLING_PARTNER_APP_CLIENT_SECRET: 'f88e2517911d607c446b88f1ad9788c611078088641a76cd751b5cc8142d4dd6',
            AWS_ACCESS_KEY_ID: 'AKIA2QUDD7OWWEQCVZHN',
            AWS_SECRET_ACCESS_KEY: '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',
            AWS_SELLING_PARTNER_ROLE: 'arn:aws:iam::722903235501:role/sp-api'
        },
        refresh_token: 'Atzr|IwEBIDRvedk_0rdCOE0tbY7iJwBiq49R90MNyXP8C1r0nH2wAhOJWUc7lX3SxvhN9lpJMmX6eJMjfDozlxJTBuqGefd-1AJtEh4UuLUDTyUP2tVwSYcZA9LmQ_N3TraPsrGKp7tPNifrfxF8CJlXu1cJ-BcgJ2AUby1Y0Vs7dSBP9Ge5LeovmUvd_ET2fICatVmxT4L1WCqIaYdMBqpJa0zvEjpQNys0DBVF_ZKUeUHws3czVlpSVhZNBpyGncf2MWDWg_Nh24B6cIo1joQO0kXb_NJ_6dmT6wzyiTEkqDaKno9PDMQuk5Tn5mt1gyroW6mWWFw'
    });




    //    if done get report document 

    let report_document = await sellingPartner.callAPI({
        operation: 'getReportDocument',
        path: {
            reportDocumentId: job.data.Report.reportDocumentId // retrieve the reportDocumentId from a "getReport" operation (when processingStatus of report is "DONE")
        }
    });

    console.log("-----Report Document Details");
    console.log(report_document);

    // finally download report and parse it

    var root = path.resolve("./");

    let report = await sellingPartner.download(report_document, {
        charset: 'cp1252',
        json: true,
        file: root + '/reports/report_all_listing-all.json'
    });


    console.log('--------- Report Done ---------');

    let merchantListingReport = report;

    let marketplacesData = await Marketplaces.find({ marketplaceId: { $in: job.data?.marketplaces } })

    marketplacesData = marketplacesData.map(item => {
        let data = {
            _id: item._id,
            marketplaceId: item.marketplaceId,
            countryCode: item.countryCode,
            regionCode: item.regionCode,
        }
        return data;
    })


    let inventories = {}
    marketplacesData.forEach((i) => {
        inventories[i.marketplaceId] = []
    })

    const recursiveFunction = async (nextToken, granularityId, id) => {
        if (nextToken && granularityId) {
            let inventory_summeries = await sellingPartner.callAPI({
                operation: 'getInventorySummaries',
                query: {
                    details: true,
                    granularityType: 'Marketplace',
                    granularityId,
                    nextToken,
                    marketplaceIds: [granularityId],
                },
            });
            let newSummaries = inventory_summeries?.inventorySummaries.map(item => {
                return { ...item, marketplaceId: id }
            })
            inventories[granularityId] = concat(inventories[granularityId], newSummaries)
            if (inventory_summeries?.nextToken) {
                await recursiveFunction(inventory_summeries?.nextToken, granularityId, id)
            }
        }
    }


    for (let i = 0; i < marketplacesData.length; i++) {
        let inventory_summeries = await sellingPartner.callAPI({
            operation: 'getInventorySummaries',
            query: {
                details: true,
                granularityType: 'Marketplace',
                granularityId: marketplacesData[i]?.marketplaceId,
                nextToken: '',
                marketplaceIds: [marketplacesData[i]?.marketplaceId],
            },
        });
        let newSummaries = inventory_summeries?.inventorySummaries.map(item => { return { ...item, marketplaceId: marketplacesData[i]?._id, marketplaceCode: upperCase(marketplacesData[i]?.countryCode) } })
        inventories[marketplacesData[i]?.marketplaceId] = concat(inventories[marketplacesData[i]?.marketplaceId], newSummaries)
        if (inventory_summeries?.nextToken) {
            await recursiveFunction(inventory_summeries?.nextToken, marketplacesData[i]?.marketplaceId, marketplacesData[i]?._id)
        }
    }


    // merging start
    for (let inv in inventories) { //objects
        let marketId = marketplacesData.find(m => m.marketplaceId === inv)
        for (let item of merchantListingReport) { //array
            let marketFoundTemp = inventories[inv].find(i => i.asin === item.asin1 && i.sellerSku === item['seller-sku'])
            if (marketFoundTemp) {
                if (!item['retailPricingAndSku']) {
                    item['retailPricingAndSku'] = [];
                }
                item['retailPricingAndSku'].push({
                    marketplace: marketFoundTemp["marketplaceCode"],
                    marketplaceId: marketId._id,
                    sku: marketFoundTemp["sellerSku"],
                    asin: marketFoundTemp["asin"],
                    fnsku: marketFoundTemp["fnSku"],
                    price: item["price"],
                    quantity: marketFoundTemp['totalQuantity'] ? parseFloat(marketFoundTemp['totalQuantity']) : 0
                })
            }
        }

    }


    let finalList = []
    finalList = merchantListingReport.filter(item => !isEmpty(item.retailPricingAndSku))

    let mergedInventory = finalList.map(newItem => {
        let data = {
            name: newItem["item-name"],
            synced: true,

            status: lowerCase(newItem["status"]),
            category: "Uncategorized",
            descriptionForPO: newItem["item-description"],
            notes: [{ text: newItem["item-note"], createdAt: new Date() }],
            listingId: newItem["listing-id"],
            sellerSku: newItem["seller-sku"],
            quantity: newItem["quantity"],
            openDate: newItem["open-date"],
            imageUrl: newItem["image-url"],
            itemIsMarketplace: newItem["item-is-marketplace"],
            productIdType: newItem["product-id-type"],
            zShopShippingFee: newItem["zshop-shipping-fee"],
            itemCondition: newItem["item-condition"],
            zshopCategory1: newItem["zshop-category1"],
            zshopBrowsePath: newItem["zshop-browse-path"],
            zshopStorefrontFeature: newItem["zshop-storefront-feature"],
            asin: newItem["asin1"],
            asin1: newItem["asin1"],
            asin2: newItem["asin2"],
            asin3: newItem["asin3"],
            willShipInternationally: newItem["will-ship-internationally"],
            expeditedShipping: newItem["expedited-shipping"],
            zshopBoldface: newItem["zshop-boldface"],
            productId: newItem["product-id"],
            bidForFeaturedPlacement: newItem["bid-for-featured-placement"],
            addDelete: newItem["add-delete"],
            pendingQuantity: newItem["pending-quantity"],
            fulfillmentChannel: newItem["fulfillment-channel"],
            merchantShippingGroup: newItem["merchant-shipping-group"],
            mfnListingExists: newItem["mfn-listing-exists"],
            mfnFulfillableQuantity: newItem["mfn-fulfillable-quantity"],
            afnListingExists: newItem["afn-listing-exists"],
            afnWarehouseQuantity: newItem["afn-warehouse-quantity"],
            // afnFulfillableQuantity: newItem?.inventoryDetails?.fulfillableQuantity ?? 0,
            afnUnsellableQuantity: newItem["afn-unsellable-quantity"] || 0,
            afnReservedQuantity: newItem["reserved_fc-transfers"] || 0,
            afnTotalQuantity: newItem["afn-total-quantity"],
            perUnitVolume: newItem["per-unit-volume"],
            afnInboundWorkingQuantity: newItem["afn-inbound-working-quantity"],
            afnInboundShippedQuantity: newItem["afn-inbound-shipped-quantity"],
            afnInboundReceivingQuantity: newItem["afn-inbound-receiving-quantity"],
            afnResearchingQuantity: newItem["afn-researching-quantity"],
            reserved_fcTransfers: newItem["afn-reserved-future-supply"],
            reserved_fcProcessing: newItem["afn-future-supply-buyable"],
            channel: "Amazon",
            retailPricingAndSku: newItem['retailPricingAndSku'],
            calculationVariables: {
                velocityDurations: [
                    "twoDays",
                    "sevenDays",
                    "fifteenDays",
                    "thirtyDays",
                    "sixtyDays",
                    "ninetyDays",
                    "oneEightyDays",
                ],
                snooze: true,
                isPurchaseOrderCreated: false,
                orderFrequency: 0,
                fbaBufferStockMin: 61,
                fbaMaxStock: 100
            },
        }
        return data;
    })

    let allAddedProducts = []

    // console.log("---merge inventory----");
    // console.log(mergedInventory);
    // mergedInventory = await Inventory.insertMany(mergedInventory);
    for (let i = 0; i < mergedInventory.length; i++) {
        let newProduct = await Inventory.findOneAndUpdate({ asin1: mergedInventory[i]?.asin1 }, { $set: mergedInventory[i] }, { upsert: true })
        if (newProduct) {
            allAddedProducts.push(newProduct)
        }
    }
    console.log("<------------TEST-------------->");
    console.log(marketplacesData);

    for (let i = 0; i < allAddedProducts.length; i++) {
        for (let c = 0; c < allAddedProducts[i].retailPricingAndSku?.length; c++) {
            let warehouseData = {
                name: allAddedProducts[i].retailPricingAndSku[c].marketplace,
                warehouseType: warehouseTypes.FBA,
                marketplaceId: allAddedProducts[i].retailPricingAndSku[c]?.marketplaceId,

                status: "Active"
            }
            let checkWarehouse = await Warehouse.findOne(warehouseData)
            if (!checkWarehouse) {
                let newWarehouse = new Warehouse(warehouseData)
                checkWarehouse = await newWarehouse.save()
                console.log("inside if", checkWarehouse)
            }
            // let thisMarketplace = await Marketplaces.findOne({ _id: marketplacesIds[c] })
            // thisMarketplace = thisMarketplace?.marketplaceId
            let warehoueId = checkWarehouse?._id
            if (warehoueId) {
                await WarehouseQuantities.updateOne({
                    mlid: allAddedProducts[i]?._id,
                    wid: warehoueId,

                }, {
                    $set: {
                        mlid: allAddedProducts[i]?._id,
                        wid: warehoueId,

                        price: parseFloat(allAddedProducts[i].retailPricingAndSku[c]?.price ?? 0),
                        quantity: parseFloat(allAddedProducts[i].retailPricingAndSku[c]?.quantity ?? 0)
                    }
                }, { upsert: true })
            }

            let catalog = await sellingPartner.callAPI({
                operation: 'getCatalogItem',
                path: {
                    asin: first(mergedInventory[i].retailPricingAndSku).asin
                },
                query: {
                    MarketplaceId: marketplacesData[c].marketplaceId
                }
            });

            let AttributeSets = first(catalog?.AttributeSets)
            let updates = {
                brand: AttributeSets?.Brand,
                color: AttributeSets?.Color,
                model: AttributeSets?.Model,
                packageQuantity: AttributeSets?.PackageQuantity,
                partNumber: AttributeSets?.PartNumber,
                productGroup: AttributeSets?.ProductGroup,
                productTypeName: AttributeSets?.ProductTypeName,
                salesRankings: AttributeSets?.SalesRankings,
                materialType: AttributeSets?.MaterialType,
                itemDimensions: AttributeSets?.ItemDimensions,
                packageDimensions: AttributeSets?.PackageDimensions,
                smallImage: AttributeSets?.SmallImage,
                image: AttributeSets?.SmallImage?.URL
            }
            // if (AttributeSets?.SmallImage) { updates.image = AttributeSets?.SmallImage?.URL }
            // dimensionsAndSpecs
            updates.dimensionsAndSpecs = {
                unit: {
                    height: 0,
                    length: 0,
                    width: 0,
                    weight: 0
                },
                carton: {
                    height: 0,
                    length: 0,
                    width: 0,
                    weight: 0
                }
            }
            updates.dimensionsAndSpecs.unitsPerCarton = 0
            updates.dimensionsAndSpecs.cartonsPerPallet = 0
            updates.dimensionsAndSpecs.palletsPerCarton = 0
            if (AttributeSets?.ItemDimensions) {
                updates.dimensionsAndSpecs.unit = {}
                if (AttributeSets?.ItemDimensions?.Height?.Units === "inches") {
                    updates.dimensionsAndSpecs.imperial = true
                    updates.dimensionsAndSpecs.metric = false
                }
                if (AttributeSets?.ItemDimensions?.Height) { updates.dimensionsAndSpecs.unit.height = AttributeSets?.ItemDimensions?.Height?.value }
                if (AttributeSets?.ItemDimensions?.Length) { updates.dimensionsAndSpecs.unit.length = AttributeSets?.ItemDimensions?.Length?.value }
                if (AttributeSets?.ItemDimensions?.Width) { updates.dimensionsAndSpecs.unit.width = AttributeSets?.ItemDimensions?.Width?.value }
                if (AttributeSets?.ItemDimensions?.Weight) { updates.dimensionsAndSpecs.unit.weight = AttributeSets?.ItemDimensions?.Weight?.value }
            }
            if (AttributeSets?.PackageDimensions) {
                updates.dimensionsAndSpecs.carton = {}
                if (AttributeSets?.PackageDimensions?.Height?.Units === "inches") {
                    updates.dimensionsAndSpecs.imperial = true
                    updates.dimensionsAndSpecs.metric = false
                }
                if (AttributeSets?.PackageDimensions?.Height) { updates.dimensionsAndSpecs.carton.height = AttributeSets?.PackageDimensions?.Height?.value }
                if (AttributeSets?.PackageDimensions?.Length) { updates.dimensionsAndSpecs.carton.length = AttributeSets?.PackageDimensions?.Length?.value }
                if (AttributeSets?.PackageDimensions?.Width) { updates.dimensionsAndSpecs.carton.width = AttributeSets?.PackageDimensions?.Width?.value }
                if (AttributeSets?.PackageDimensions?.Weight) { updates.dimensionsAndSpecs.carton.weight = AttributeSets?.PackageDimensions?.Weight?.value }
            }
            // dimensionsAndSpecs
            const cleanedObject = pickBy(updates, v => v !== undefined)
            if (!isEmpty(cleanedObject)) {
                await Inventory.updateOne(
                    { _id: allAddedProducts[i]?._id }, {
                    $set: cleanedObject
                }
                )
            }
        }
    }



    return "2nd Job Done";

}, {
    connection: {
        host: "34.200.218.53",
        port: 6379,
        password: 'inventooly@_@045'
    }
}
);


ProcessReports.on('completed', async (Job, returnvalue) => {





    console.log("Process Report Done");





});

export default ProcessReports;