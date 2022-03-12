import { Queue, Worker, Job, QueueScheduler } from 'bullmq';
import SellingPartnerAPI from 'amazon-sp-api';
import path from 'path';
import Marketplaces from '../models/marketplaces.js';
import { marketplaces } from "../constants/marketplaces.js"
import { Console } from 'console';
import Inventory from '../models/master-listing.js';
import Orders from '../models/orders.js';
import Warehouse from '../models/warehouse.js';
import WarehouseQuantities from "../models/warehouse-quantities.js";
import { warehouseTypes, reportType, taskTypes, taskStatus } from "../enumerations/index.js";
import concat from 'lodash/concat.js';
import first from 'lodash/first.js';
import isEmpty from 'lodash/isEmpty.js';
import pickBy from 'lodash/pickBy.js';
import lowerCase from 'lodash/lowerCase.js';
import upperCase from 'lodash/upperCase.js';

const SaveOrdersToDatabase = new Worker('SaveOrdersToDatabase', async (job) => {
    console.log('---------------------SAVE ORDERS TO DB-------------------------')
    console.log('---------------------SAVE ORDERS TO DB-------------------------')
    console.log('---------------------SAVE ORDERS TO DB-------------------------')

    // return job.data;
    // if done get report document which will return orders


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
    let report_document = await sellingPartner.callAPI({//operation: 'getReportDocument', reportDocumentId: res1.reportDocumentId
        operation: 'getReportDocument',
        path: {
            reportDocumentId: job.data.Report.reportDocumentId // retrieve the reportDocumentId from a "getReport" operation (when processingStatus of report is "DONE")
        }
    });
    console.log("-----Report Document Details  report_document");
    console.log(report_document);


    // creating files
    // var root = path.dirname(require.main.filename)
    let report = await sellingPartner.download(report_document, {
        charset: 'cp1252',
        json: true,
        // file: root + `/${obj.name}.json`
    });


    // shapping orders according to Modal
    let mergedReports = report.map(newItem => {
        let data = {
            // storeId: userData._id,
            // tenantId: userData.tenantId,
            orderId: newItem["amazon-order-id"],
            merchantOrderId: newItem["merchant-order-id"],
            purchaseDate: newItem["purchase-date"],
            lastUpdatedDate: newItem["last-updated-date"],
            orderStatus: newItem["order-status"],
            fulfillmentChannel: newItem["fulfillment-channel"],
            salesChannel: newItem["sales-channel"],
            orderChannel: newItem["order-channel"],
            shipServiceLevel: newItem["ship-service-level"],
            productName: newItem["product-name"],
            sku: newItem["sku"],
            asin: newItem["asin"],
            itemStatus: newItem["item-status"],
            quantity: newItem["quantity"],
            currency: newItem["currency"],
            itemPrice: newItem["item-price"],
            itemTax: newItem["item-tax"],
            shippingPrice: newItem["shipping-price"],
            shippingTax: newItem["shipping-tax"],
            giftWrapPrice: newItem["gift-wrap-price"],
            giftWrapTax: newItem["gift-wrap-tax"],
            itemPromotionDiscount: newItem["item-promotion-discount"],
            shipPromotionDiscount: newItem["ship-promotion-discount"],
            shipCity: newItem["ship-city"],
            shipState: newItem["ship-state"],
            shipPostalCode: newItem["ship-postal-code"],
            shipCountry: newItem["ship-country"],
            promotionIds: newItem["promotion-ids"],
            isBusinessOrder: newItem["is-business-order"],
            purchaseOrderNumber: newItem["purchase-order-number"],
            priceDesignation: newItem["price-designation"],
        }
        return data;
    })


    //storing order to database
    for (let i = 0; i < mergedReports.length; i++) {
        await Orders.updateOne(
            { orderId: mergedReports[i]?.orderId, asin: mergedReports[i]?.asin },
            { $set: mergedReports[i] },
            { upsert: true }
        )
    }

    console.log('-------Merge Report---------');
    console.log('--------- Report Done ---------');
    console.log("--------- MergedReports ---------", mergedReports.length)
    console.log('---length---', report.length);




    // if (res1.processingStatus === 'DONE') {

    //     //Process Report
    //     const PRorders = new Queue('ProcessOrders', {
    //         connection: {
    //             host: "34.200.218.53",
    //             port: 6379,
    //             password: 'inventooly@_@045'
    //         }
    //     });

    //     await PRorders.add('ProcessOrders', { Report: res1 });


    //     console.log("Process Report Job should be created");
    // }
    // else {


    //     const Reports = new Queue('GetReports', {
    //         connection: {
    //             host: "34.200.218.53",
    //             port: 6379,
    //             password: 'inventooly@_@045'
    //         }
    //     });

    //     await Reports.add('GetOrders', { Report: res1 }, { delay: 10000 });

    //     console.log("Status Was not Done.Job created again");

    //     //GetReport Again.
    // }






}, {
    connection: {
        host: "34.200.218.53",
        port: 6379,
        password: 'inventooly@_@045'
    }
});

SaveOrdersToDatabase.on('completed', async (Job, returnvalue) => {
    console.log("******************* SaveOrdersToDatabase *******************");

});

export default SaveOrdersToDatabase;