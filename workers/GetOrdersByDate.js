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

const GetOrdersByDate = new Worker('GetOrdersByDate', async (job) => {

    console.log('---------------------GET ORDERS BY DATE-------------------------')
    console.log('---------------------GET ORDERS BY DATE-------------------------')
    console.log('---------------------GET ORDERS BY DATE-------------------------')
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

    //operation: 'createReport',reportType: 'GET_MERCHANT_LISTINGS_ALL_DATA',marketplaceIds: ['A2EUQ1WTGCTBG2', 'ATVPDKIKX0DER']
    let OrderReportByDate = await sellingPartner.callAPI({
        operation: 'createReport',
        body: {
            // reportType: 'GET_MERCHANT_LISTINGS_ALL_DATA',
            // reportType: 'GET_FBA_FULFILLMENT_INBOUND_NONCOMPLIANCE_DATA',
            // reportType:'GET_FBA_MYI_ALL_INVENTORY_DATA',
            reportType: 'GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL',
            dataStartTime: job.data.ordersDate.start,
            dataEndTime: job.data.ordersDate.end,
            marketplaceIds: ['ATVPDKIKX0DER']
        }
    });

    console.log('-------Get Orders By Date Status ---------');
    console.log(OrderReportByDate);

    if (OrderReportByDate.reportId) {
        const PRorders = new Queue('ProcessOrders', {
            connection: {
                host: "34.200.218.53",
                port: 6379,
                password: 'inventooly@_@045'
            }
        });

        await PRorders.add('ProcessOrders', { Report: OrderReportByDate }, { delay: 10000 });
        console.log("--------- OrderReportByDate DONE ---------");
    }
    else {

        console.log("Report wasnt created ---- try again ----");

        const Reports = new Queue('GetOrdersByDate', {
            connection: {
                host: "34.200.218.53",
                port: 6379,
                password: 'inventooly@_@045'
            }
        });

        await Reports.add('GetOrdersByDate', { Report: job }, { delay: 10000 });
    }

    return OrderReportByDate;

}, {
    connection: {
        host: "34.200.218.53",
        port: 6379,
        password: 'inventooly@_@045'
    }
});

GetOrdersByDate.on('completed', async (Job, returnvalue) => {

    console.log("------------ GetOrdersByDate ---------------");

});

export default GetOrdersByDate;