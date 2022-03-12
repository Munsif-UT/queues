import { Queue, Worker, Job, QueueScheduler } from 'bullmq';
import SellingPartnerAPI from 'amazon-sp-api';
import path from 'path';
import Marketplaces from '../models/marketplaces.js';
import { marketplaces } from "../constants/marketplaces.js"



const getMarketPlaces = new Worker('myqueue', async (job) => {



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

    let marketplacesData = await sellingPartner.callAPI({
        operation: 'getMarketplaceParticipations'
    });



    marketplacesData = marketplacesData.map(item => item.marketplace.countryCode) // getting countryCode
    marketplacesData = marketplacesData.filter(function (item, pos, self) {
        return self.indexOf(item) == pos;
    }) // filtering countryCode
    let marketplacesIds = await Marketplaces.find({ countryCode: { $in: marketplacesData } }) // finding marketplaces ids by countryCodes
    marketplacesIds = marketplacesIds.map(item => item._id) // getting marketplacesIds
    // await Warehouse.updateMany({ tenantId: userData.tenantId, marketplaceId: { $in: marketplacesIds } }, { $set: { status: "Active" } }) // setting warehouses as active with respective marketplacesIDs
    let allMarketplaces = Object.values(marketplaces).map(item => item).flat()
    marketplacesData = allMarketplaces.filter(item => marketplacesData.includes(item.countryCode))
    marketplacesData = marketplacesData.map(item => item.marketplaceId)





    console.log(marketplacesData);




    // let getOrders = await sellingPartner.callAPI({
    //     operation: 'getOrders',
    //     query: {

    //         MarketplaceIds: ['ATVPDKIKX0DER'],
    //         LastUpdatedAfter:'2020-01-22T00:00:00-07:00'
    //     }
    // });






    // let catalog = await sellingPartner.callAPI({

    //     operation: 'getCatalogItem',
    //     endpoint:'catalogItems',
    //     path: {
    //         //asin:'B091TTNJMZ'
    //         // asin:'B09MR8BK6D'
    //         asin:'B091TTNJMZ'
    //     },
    //     query: {
    //         MarketplaceId: ['ATVPDKIKX0DER'],
    //         // includedData: ["attributes,identifiers,images,productTypes,salesRanks,summaries,variations"]
    //     },
    //     // options: {
    //     //     version: '2020-12-01'
    //     // }
    // });


    // console.log("<--------Catalog---------->");

    // console.log(catalog);


    // return (catalog);
    // console.log("<--------Orders---------->");
    // console.log(getOrders);


    //This should be first Job.


    //creating report

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

    //sending to reports job



    const Reports = new Queue('ReportsJobs', {
        connection: {
            host: "34.200.218.53",
            port: 6379,
            password: 'inventooly@_@045'
        }
    });

    await Reports.add('GetReport', { createReport: createReport, marketplaces: marketplacesData }, { delay: 60000 });


    return "Get Market Places Done";




    // return "done doing 1st job";


}, {
    connection: {
        host: "34.200.218.53",
        port: 6379,
        password: 'inventooly@_@045'
    }
});

getMarketPlaces.on('completed', (Job, returnvalue) => {


    console.log(returnvalue);

});

export default getMarketPlaces;