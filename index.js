import express from 'express';
import { Queue, Job, QueueScheduler } from 'bullmq';

import { createBullBoard } from 'bull-board';
import { BullMQAdapter } from 'bull-board/bullMQAdapter.js';
import mongoose from 'mongoose';
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
import getMarketPlaces from './workers/getMarketPlaces.js';
import GetReports from './workers/GetReports.js';
import CreateReports from './workers/CreateReports.js';
import ProcessReports from './workers/ProcessReports.js';
import GetOrdersByDate from './workers/GetOrdersByDate.js';
import ProcessOrders from './workers/ProcessOrders.js';
import SaveOrdersToDatabase from './workers/SaveOrdersToDatabase.js'


const setupDatabase = () => {
  if (
    mongoose.connection.readyState !== 1 ||
    mongoose.connection.readyState !== 2
  ) {
    mongoose
      .connect("mongodb+srv://inventooly-queus:inventooly@test1-cluster.namne.mongodb.net/test", options)
      .then(() => {
        console.info('[INFO] MongoDB Database connected.');
      })
      .catch((err) =>
        console.log('[ERROR] Unable to connect to the database:', err)
      );
  }
};

setupDatabase();

const myQueue = new Queue('myqueue', {
  connection: {
    host: "34.200.218.53",
    port: 6379,
    password: 'inventooly@_@045'
  }
});


const CreateReportsQueue = new Queue('CreateReports', {
  connection: {
    host: "34.200.218.53",
    port: 6379,
    password: 'inventooly@_@045'
  }
});


const GetReportsQueue = new Queue('GetReports', {
  connection: {
    host: "34.200.218.53",
    port: 6379,
    password: 'inventooly@_@045'
  }
});


const ProcessReportsQueue = new Queue('ProcessReports', {
  connection: {
    host: "34.200.218.53",
    port: 6379,
    password: 'inventooly@_@045'
  }
});

const GetOrdersByDateQueue = new Queue('GetOrdersByDate', {
  connection: {
    host: "34.200.218.53",
    port: 6379,
    password: 'inventooly@_@045'
  }
});
const ProcessOrdersQueue = new Queue('ProcessOrders', {
  connection: {
    host: "34.200.218.53",
    port: 6379,
    password: 'inventooly@_@045'
  }
});
const SaveOrdersToDb = new Queue('SaveOrdersToDatabase', {
  connection: {
    host: "34.200.218.53",
    port: 6379,
    password: 'inventooly@_@045'
  }
});


const GetReportsScheduler = new QueueScheduler('GetReports', {
  connection: {
    host: "34.200.218.53",
    port: 6379,
    password: 'inventooly@_@045'
  }
});

const GetProcessOrdersScheduler = new QueueScheduler('ProcessOrders', {
  connection: {
    host: "34.200.218.53",
    port: 6379,
    password: 'inventooly@_@045'
  }
});
const GetSaveOrdersToDbScheduler = new QueueScheduler('SaveOrdersToDatabase', {
  connection: {
    host: "34.200.218.53",
    port: 6379,
    password: 'inventooly@_@045'
  }
});






const { router, setQueues, replaceQueues, addQueue, removeQueue } = createBullBoard([

  new BullMQAdapter(CreateReportsQueue),
  new BullMQAdapter(GetReportsQueue),
  new BullMQAdapter(ProcessReportsQueue),
  new BullMQAdapter(GetOrdersByDateQueue),
  new BullMQAdapter(ProcessOrdersQueue),
  new BullMQAdapter(SaveOrdersToDb),

]);






var app = express();


app.use('/admin/queues', router)


app.get('/addjob', async function (req, res) {

  // await myQueue.add('BackgroundJob', { colour: 'red' });

  await CreateReportsQueue.add('CreateReport', { type: "GET_ORDERS" });
  // await myQueue.add('paint', { colour: 'blue' },{ delay: 50000 });
  // await myQueue.add('paint', { colour: 'green' },{ delay: 100000 });

  return res.json({ "message": "done adding jobs" });

});

app.get('/', function (req, res) {







  // await hubspotClient.crm.companies.associationsApi.create(
  //   createCompanyResponse.body.id,
  //   'contacts',
  //   createContactResponse.body.id,
  //   'company_to_contact'
  // )





  // const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

  (async () => {
    try {

      // let sellingPartner_n = new SellingPartnerAPI({
      //   region: 'na',
      //   credentials: {
      //     SELLING_PARTNER_APP_CLIENT_ID: 'amzn1.application-oa2-client.59178859d5084b37921366f54dcad67a',
      //     SELLING_PARTNER_APP_CLIENT_SECRET: 'f88e2517911d607c446b88f1ad9788c611078088641a76cd751b5cc8142d4dd6',
      //     AWS_ACCESS_KEY_ID: 'AKIA2QUDD7OWYB47MPEG',
      //     AWS_SECRET_ACCESS_KEY: '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',
      //     AWS_SELLING_PARTNER_ROLE: 'arn:aws:iam::722903235501:role/sp-api'
      //   },
      //   options: {
      //     auto_request_tokens: false,
      //     only_grantless_operations: true
      //   }
      // });

      // await sellingPartner_n.refreshAccessToken('sellingpartnerapi::migration');
      // await sellingPartner_n.refreshRoleCredentials();

      // let code = await sellingPartner_n.callAPI({
      //   operation: 'getAuthorizationCode',
      //   query: {
      //     sellingPartnerId: 'APYFTRL0WQJKK',
      //     developerId: '633671571707',
      //     mwsAuthToken: 'amzn.mws.9ebc5900-9611-b159-0050-3fb5832c258c'
      //   }
      // });


      // return res.json(code);




      // let sellingPartner = new SellingPartnerAPI({
      //   region: 'na', // The region of the selling partner API endpoint ("eu", "na" or "fe")
      //   credentials: {
      //     SELLING_PARTNER_APP_CLIENT_ID: 'amzn1.application-oa2-client.59178859d5084b37921366f54dcad67a',
      //     SELLING_PARTNER_APP_CLIENT_SECRET: 'f88e2517911d607c446b88f1ad9788c611078088641a76cd751b5cc8142d4dd6',
      //     AWS_ACCESS_KEY_ID: 'AKIA2QUDD7OWWEQCVZHN',
      //     AWS_SECRET_ACCESS_KEY: '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',
      //     AWS_SELLING_PARTNER_ROLE: 'arn:aws:iam::722903235501:role/sp-api'
      //   },
      //   refresh_token: 'Atzr|IwEBILO40YShQRgHx8AgDlmiaY1xk2VxDcjGlEzbXuo7ROba81rCgIteJh02lrR8MlwZNWPT40sByaElvky_oedBsUjfBenBTgD3H6YGFyuSz1d4tFvBIdu8TCKG-ghGUddrRvpN8_R_fBJONIZ9JtlnUwufK3s33UMp2KyyuaLr78j_dc394WZPgydMYjYvmfMRVL-9TCbs18zD0DMP8_tRn1Us1pPWA22HFr4k8S6GI71iJxviLduWaTDv-AT-RkN9tHKvL1yQSiPkzt3s_V0nAkINQXLuGB0BZewyC2HxYAVTjGQJ37YFxrKIVf74EcTIsEA'
      // });

      // let marketplaces = await sellingPartner.callAPI({
      //   operation: 'getMarketplaceParticipations'
      // });


      // console.log(marketplaces);

      // return res.json(marketplaces);

      let inventory_summeries = await sellingPartner.callAPI({
        operation: 'getInventorySummaries',
        query: {
          details: true,
          granularityType: 'Marketplace',
          granularityId: 'ATVPDKIKX0DER',
          nextToken: '',
          marketplaceIds: ['ATVPDKIKX0DER'],
        },

      });

      return res.json(inventory_summeries);

      // for (var attributename in inventory_summeries["inventorySummaries"]) {


      //   const inv = { asin:inventory_summeries["inventorySummaries"][attributename]["asin"], fasin: inventory_summeries["inventorySummaries"][attributename]["fnSku"], title: 'test' };

      //   con.query('INSERT INTO amazon_inventory SET ?', inv, (err, res) => {
      //     if (err) throw err;

      //     console.log('Last insert ID:', res.insertId);
      //   });


      //   // return res.json(attributename + ": " + inventory_summeries[attributename]);

      // }




      // return res.json(inventory_summeries);



      // let shipment = await sellingPartner.callAPI({
      //   operation: 'getShipmentItemsByShipmentId',
      //    path: {
      //     shipmentId: 'FBA15J7NG6TK'
      //   },
      //   query: {
      //     MarketplaceId: ['ATVPDKIKX0DER'],
      //     // NextToken:"AAAAAAAAAABqjCy5onQ5QWd9c7BjPrNjUAEAAAAAAABrbkp3Qh0Ah89vHWop0PWUzqG4SYWPz2/bnBuq5v8GBF/t197e+z0AGla7FtvSkq8Woi2OmCpwmWJSBEc3CTrljoS9c9bl4Wf8BfhmKkSGIqXeyEyXp8QH32iIWPYW+illn17DAdPKN363guik08nfyfGpUhPNq/NPsqr4D7YBHGkX9/w/flYLL/0F0M8jIndqvybUBpdsbmQtbUb6esPZplHKiUAayWfATUIr875/gyqVK4862L5atBcAQjnIkqw1c5zNjkPSnBasYrUpbqcVClzNIqohwKb9Ty/NLOnb2qXsMs0B/PJ8eJWjwQT3vHGMo/3lsLfbIzbQfBA7BlzYoaa1MzwZ6ryp5Ns+jpUa1a8hSj6Do3pnoBN9ctf+ep1p63NymbyE6I+prwIZcajkhtAQEFmm3Yzxicfk8+HYwiZYw9g+kQmeVmbSyZI/zWU="
      //   },

      // });


      // let shipmentitems = await sellingPartner.callAPI({
      //   operation: 'getShipmentItems',
      //   query: {
      //     QueryType: 'SHIPMENT',
      //     MarketplaceId: ['ATVPDKIKX0DER']
      //   },
      //   path: {
      //     shipmentId: 'FBA15J7NG6TK'
      //   }


      // });

      // return res.json(shipment);


      // let catalog= await sellingPartner.callAPI({
      //   operation:'getCatalogItem',
      //   path:{
      //     asin:'B01LEA801A'
      //   },
      //   query:{
      //     MarketplaceId:['ATVPDKIKX0DER']
      //   }
      // });


      // return res.json(catalog);

      // Create Report

      let createReport = await sellingPartner.callAPI({
        operation: 'createReport',
        body: {
          reportType: 'GET_MERCHANT_LISTINGS_ALL_DATA',
          // reportType: 'GET_FBA_FULFILLMENT_INBOUND_NONCOMPLIANCE_DATA',
          // reportType:'GET_FBA_MYI_ALL_INVENTORY_DATA',
          // reportType: 'GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL',
          // dataStartTime: '2020-01-01T00:00:00-07:00',
          // dataEndTime: '2020-01-22T00:00:00-07:00',
          marketplaceIds: ['A2EUQ1WTGCTBG2', 'ATVPDKIKX0DER', 'A1AM78C64UM0Y8']
        }
      });



      await sleep(50000);

      // get report document status
      let res1 = await sellingPartner.callAPI({
        operation: 'getReport',
        path: {
          reportId: createReport.reportId // retrieve the reportDocumentId from a "getReport" operation (when processingStatus of report is "DONE")
        }
      });

      console.log('-------Report Status ---------');

      console.log(res1);

      // if done get report document 

      let report_document = await sellingPartner.callAPI({
        operation: 'getReportDocument',
        path: {
          reportDocumentId: res1.reportDocumentId // retrieve the reportDocumentId from a "getReport" operation (when processingStatus of report is "DONE")
        }
      });

      console.log("-----Report Document Details");
      console.log(report_document);

      // finally download report and parse it

      var root = path.dirname(require.main.filename)

      let report = await sellingPartner.download(report_document, {
        charset: 'cp1252',
        json: true,
        file: root + '/report_all_listing-all.json'
      });


      console.log('--------- Report Done ---------');

      console.log(report);


      return res.json(report);

      // res.send("check console. Call done");
    } catch (e) {
      console.log(e);
    }
  })();



});
app.listen(4000, function () {
  console.log('Example app listening on port 4000!');
});


export default app;
