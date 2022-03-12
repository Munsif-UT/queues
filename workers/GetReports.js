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

const GetReports = new Worker('GetReports', async (job) => {
    console.log('---------------------GET REPORTS-------------------------')
    console.log('---------------------GET REPORTS-------------------------')
    console.log('---------------------GET REPORTS-------------------------')
    console.log('reportId->', job.data.Report.reportId)
    console.log('type->', job.data.type)
    console.log('process-->', job.data)
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


    // get report document status

    let res1 = await sellingPartner.callAPI({
        operation: 'getReport',
        path: {
            reportId: job.data.Report.reportId // retrieve the reportDocumentId from a "getReport" operation (when processingStatus of report is "DONE")
        }
    });

    console.log('-------Report Status ---------');

    console.log(res1?.processingStatus);

    if (res1.processingStatus === 'DONE') {

        //Process Report
        if (job.data.type === "order") {
            console.log('------inside order get reports --------')
            const saveOrderToDb = new Queue('SaveOrdersToDatabase', {
                connection: {
                    host: "34.200.218.53",
                    port: 6379,
                    password: 'inventooly@_@045'
                }
            });

            console.log('over saveOrdersToDB')
            await saveOrderToDb.add('SaveOrdersToDatabase', { Report: res1, marketplaces: ['ATVPDKIKX0DER'] });
            return '----------- saveOrdersToDB done ------------'
        }
        else {
            const PReports = new Queue('ProcessReports', {
                connection: {
                    host: "34.200.218.53",
                    port: 6379,
                    password: 'inventooly@_@045'
                }
            });

            await PReports.add('ProcessReports', { Report: res1, marketplaces: ['ATVPDKIKX0DER'] });
            console.log("Process Report Job should be created");
            return '----------- ProcessReports done------------'

        }
    }
    else {
        const Reports = new Queue('GetReports', {
            connection: {
                host: "34.200.218.53",
                port: 6379,
                password: 'inventooly@_@045'
            }
        });
        console.log('----before----', job.data)
        await Reports.add('GetReports', { Report: job }, { delay: 10000 });

        console.log("Status Was not Done Job created again");

        //GetReport Again.
    }



    return res1;




}, {
    connection: {
        host: "34.200.218.53",
        port: 6379,
        password: 'inventooly@_@045'
    }
});

GetReports.on('completed', async (Job, returnvalue) => {





    console.log("------------Get Report Done---------------");






});

export default GetReports;