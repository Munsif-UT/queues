import { Queue, Worker, Job, QueueScheduler } from 'bullmq';
import SellingPartnerAPI from 'amazon-sp-api';
import path from 'path';
import Marketplaces from '../models/marketplaces.js';
import { marketplaces } from "../constants/marketplaces.js"
import moment from 'moment';




const CreateReports = new Worker('CreateReports', async (job) => {
    // console.log(job.data);
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
        // refresh_token: 'Atzr|IwEBIDRvedk_0rdCOE0tbY7iJwBiq49R90MNyXP8C1r0nH2wAhOJWUc7lX3SxvhN9lpJMmX6eJMjfDozlxJTBuqGefd-1AJtEh4UuLUDTyUP2tVwSYcZA9LmQ_N3TraPsrGKp7tPNifrfxF8CJlXu1cJ-BcgJ2AUby1Y0Vs7dSBP9Ge5LeovmUvd_ET2fICatVmxT4L1WCqIaYdMBqpJa0zvEjpQNys0DBVF_ZKUeUHws3czVlpSVhZNBpyGncf2MWDWg_Nh24B6cIo1joQO0kXb_NJ_6dmT6wzyiTEkqDaKno9PDMQuk5Tn5mt1gyroW6mWWFw'
    });


    if (job.data.type === 'GET_INVENTORY') {
        //create report --> GET_MERCHANT_LISTINGS_ALL_DATA
        let createReport = await sellingPartner.callAPI({
            operation: 'createReport',
            body: {
                reportType: 'GET_MERCHANT_LISTINGS_ALL_DATA',
                // reportType: 'GET_FBA_FULFILLMENT_INBOUND_NONCOMPLIANCE_DATA',
                // reportType:'GET_FBA_MYI_ALL_INVENTORY_DATA',
                // reportType: 'GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL',
                // dataStartTime: '2020-01-01T00:00:00-07:00',
                // dataEndTime: '2020-01-22T00:00:00-07:00',
                marketplaceIds: ['ATVPDKIKX0DER']
            }
        });

        const Reports = new Queue('GetReports', {
            connection: {
                host: "34.200.218.53",
                port: 6379,
                password: 'inventooly@_@045'
            }
        });

        await Reports.add('GetReports', { Report: createReport, type: "inventory" }, { delay: 10000 });
        return createReport;
    }
    else {

        // Generate 12 Months date range
        let getOrdersTo = 6;
        let months = [];
        for (let i = 0; i < getOrdersTo; i++) {
            months[i] = {
                start: moment().subtract(i + 1, "months").endOf('day').toISOString(),
                end: moment().subtract(i, "months").startOf('day').toISOString(),
                name: `name${i + 1}`
            }
        }

        // console.log('-----------------months array created-------------------');
        // console.log(months);



        const getOrdersByDate = new Queue('GetOrdersByDate', {
            connection: {
                host: "34.200.218.53",
                port: 6379,
                password: 'inventooly@_@045'
            }
        });
        for (let index = 0; index < months.length; index++) {
            // asyncFunction(months[index], userData);
            await getOrdersByDate.add('GetOrdersByDate', { ordersDate: months[index] });
            // create a job which get orders from amazon accorfing to given date

        }
        return "DONE ADDING ORDRS TO DB"
    }




}, {
    connection: {
        host: "34.200.218.53",
        port: 6379,
        password: 'inventooly@_@045'
    }

});


CreateReports.on('completed', (Job, returnvalue) => {

    console.log("Done Creating Report and Scheduling GetReport Job.");

});


export default CreateReports;