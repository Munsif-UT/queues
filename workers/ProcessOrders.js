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

const ProcessOrders = new Worker('ProcessOrders', async (job) => {

    console.log('---------------------PROCESS REPORT-------------------------')
    console.log('---------------------PROCESS REPORT-------------------------')
    console.log('---------------------PROCESS REPORT-------------------------')
    console.log('------------PORID----------------->', job.data.Report.reportId);


    //will return us details of report -> report id
    // let res1 = await sellingPartner.callAPI({
    //     operation: 'getReport',
    //     path: {
    //         reportId: job.data.Report.reportId // retrieve the reportDocumentId from a "getReport" operation (when processingStatus of report is "DONE")
    //     }
    // });

    // console.log('-------Process Orders Status ---------');

    // console.log(res1);


    const Reports = new Queue('GetReports', {
        connection: {
            host: "34.200.218.53",
            port: 6379,
            password: 'inventooly@_@045'
        }
    });

    console.log('---------JDRID-----------------', job.data.Report)
    await Reports.add('GetReports', { Report: job.data.Report, type: "order" }, { delay: 300000 });
    // console.log('-------------------->', res1)
    return "orders processing done";
    // // if done get report document which will return orders 
    // let report_document = await sellingPartner.callAPI({//operation: 'getReportDocument', reportDocumentId: res1.reportDocumentId
    //     operation: 'getReportDocument',
    //     path: {
    //         reportDocumentId: res1.reportDocumentId // retrieve the reportDocumentId from a "getReport" operation (when processingStatus of report is "DONE")
    //     }
    // });
    // console.log("-----Report Document Details  report_document");
    // console.log(report_document);


    // // creating files
    // // var root = path.dirname(require.main.filename)
    // let report = await sellingPartner.download(report_document, {
    //     charset: 'cp1252',
    //     json: true,
    //     // file: root + `/${obj.name}.json`
    // });


    // // shapping orders according to Modal
    // let mergedReports = report.map(newItem => {
    //     let data = {
    //         storeId: userData._id,
    //         tenantId: userData.tenantId,
    //         orderId: newItem["amazon-order-id"],
    //         merchantOrderId: newItem["merchant-order-id"],
    //         purchaseDate: newItem["purchase-date"],
    //         lastUpdatedDate: newItem["last-updated-date"],
    //         orderStatus: newItem["order-status"],
    //         fulfillmentChannel: newItem["fulfillment-channel"],
    //         salesChannel: newItem["sales-channel"],
    //         orderChannel: newItem["order-channel"],
    //         shipServiceLevel: newItem["ship-service-level"],
    //         productName: newItem["product-name"],
    //         sku: newItem["sku"],
    //         asin: newItem["asin"],
    //         itemStatus: newItem["item-status"],
    //         quantity: newItem["quantity"],
    //         currency: newItem["currency"],
    //         itemPrice: newItem["item-price"],
    //         itemTax: newItem["item-tax"],
    //         shippingPrice: newItem["shipping-price"],
    //         shippingTax: newItem["shipping-tax"],
    //         giftWrapPrice: newItem["gift-wrap-price"],
    //         giftWrapTax: newItem["gift-wrap-tax"],
    //         itemPromotionDiscount: newItem["item-promotion-discount"],
    //         shipPromotionDiscount: newItem["ship-promotion-discount"],
    //         shipCity: newItem["ship-city"],
    //         shipState: newItem["ship-state"],
    //         shipPostalCode: newItem["ship-postal-code"],
    //         shipCountry: newItem["ship-country"],
    //         promotionIds: newItem["promotion-ids"],
    //         isBusinessOrder: newItem["is-business-order"],
    //         purchaseOrderNumber: newItem["purchase-order-number"],
    //         priceDesignation: newItem["price-designation"],
    //     }
    //     return data;
    // })


    // //storing order to database
    // for (let i = 0; i < mergedReports.length; i++) {
    //     await Orders.updateOne(
    //         { orderId: mergedReports[i]?.orderId, asin: mergedReports[i]?.asin },
    //         { $set: mergedReports[i] },
    //         { upsert: true }
    //     )
    // }

    // console.log('-------Merge Report---------');
    // console.log('--------- Report Done ---------');
    // console.log("--------- MergedReports ---------", mergedReports.length)
    // console.log(report.length);




    // // if (res1.processingStatus === 'DONE') {

    // //     //Process Report
    // //     const PRorders = new Queue('ProcessOrders', {
    // //         connection: {
    // //             host: "34.200.218.53",
    // //             port: 6379,
    // //             password: 'inventooly@_@045'
    // //         }
    // //     });

    // //     await PRorders.add('ProcessOrders', { Report: res1 });


    // //     console.log("Process Report Job should be created");
    // // }
    // // else {


    // //     const Reports = new Queue('GetReports', {
    // //         connection: {
    // //             host: "34.200.218.53",
    // //             port: 6379,
    // //             password: 'inventooly@_@045'
    // //         }
    // //     });

    // //     await Reports.add('GetOrders', { Report: res1 }, { delay: 10000 });

    // //     console.log("Status Was not Done.Job created again");

    // //     //GetReport Again.
    // // }



    // return res1;




}, {
    connection: {
        host: "34.200.218.53",
        port: 6379,
        password: 'inventooly@_@045'
    }
});

ProcessOrders.on('completed', async (Job, returnvalue) => {

    console.log("------------ ProcessOrders ---------------");

});

export default ProcessOrders;