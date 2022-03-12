import Inventory from "../models/master-listing";
import { forecasting } from "./forecasting";
import stockTrackInitialArray from "./stockTrackInitialArray";
import { getOverUnderStockItems } from "./top-charts";

const checkStock = async (sendNotification) => {
  console.log("Started tracking stocks");
  let aggregation = [];
  aggregation.push({
    $lookup: {
      from: "warehousequantities",
      localField: "_id",
      foreignField: "mlid",
      as: "wq",
    },
  });
  aggregation.push({
    $lookup: {
      from: "supplychaintimes",
      localField: "supplyChainTime.supplyChainTimeId",
      foreignField: "_id",
      as: "leadTime",
    },
  });
  aggregation.push({
    $unwind: { path: "$leadTime", preserveNullAndEmptyArrays: true },
  });
  aggregation.push({
    $lookup: {
      from: "orders",
      let: { tenantId: "$tenantId", asin: "$asin1" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                // { $gte: ["$purchaseDate", moment().subtract(365, 'days').toISOString()] },
                { $eq: ["$tenantId", "$$tenantId"] },
                { $eq: ["$asin", "$$asin"] },
              ],
            },
          },
        },
      ],
      as: "orders",
    },
  });

  try {
    // getting all inventory data
    let totalInventory = await Inventory.aggregate(aggregation);
    // formating data
    totalInventory = forecasting(totalInventory, {});
    // saperating overstock and understtock items
    let stocks = getOverUnderStockItems(totalInventory);
    let promises = [];
    //checking year
    const _curentDate = new Date();
    const currentYear = _curentDate.getFullYear();
    // let checkYearChange = false;
    // stocks.overstockItems.forEach((item) => {
    //   const check = item.overStockTrack.some((item) => {
    //     if (!item.date) {
    //       return false;
    //     }
    //     const d = new Date(item.date);
    //     return d.getFullYear() !== currentYear;
    //   });
    //   if (check) checkYearChange = true;
    // });

    // if(!checkYearChange){
    stocks.overstockItems.forEach((item) => {
      let arrTopush = [];
      if (item.overStockTrack) {
        item.overStockTrack.forEach((ovItem, i) => {
          ///checking if arrTopush length is less then 12.
          if (arrTopush.length < 12) {
            const currentDate = new Date(); //current date

            //we have two fields in ovItem 1. Date 2. Count
            //1. Date => Tells when the product was overstocked last time. If null then it is considered as normal condition where item is niether overstocked nor understocked
            //2. Count => Count can either be 1 or 0. 1 means that item is currently overstocked and 0 means item is not overstocked.

            if (ovItem?.date) {
              //checking if date is null or not. If date is null it means item is overstocked first time
              let date = new Date(ovItem.date);
              // console.log("iteration",i,"year",date.getFullYear(),"===",currentDate.getFullYear(),"month",date.getMonth(),"===",currentDate.getMonth())
              const sameMonth = date.getMonth() === currentDate.getMonth();
              if (date.getFullYear() === currentYear) {
                //this condition says that the year is same
                arrTopush.push({
                  count: sameMonth ? 1 : ovItem.count,
                  date: currentDate, //adding current date becuase we want to make track of item last overstock time
                });
              } else {
                // this conditions says that year is not same
                // Now we will pop first element of overstocktrack and and push a new element with new month and year
                // push 12 elements in arrTopush
                if (sameMonth) {
                  //only run this loop when months are same and year is different
                  for (let i = 0; i < 12; i++) {
                    let date = item.overStockTrack[i]?.date;
                    if (
                      i === 12 &&
                      date &&
                      date.getFullYear() !== currentDate.getFullYear()
                    ) {
                      arrTopush({
                        count: 1,
                        date: currentDate,
                      });
                    } else {
                      let nextElemCount = item.overStockTrack[i + 1]?.count;
                      const newDate = moment(date).add("1", "month");
                      arrTopush.push({
                        count: nextElemCount,
                        date: newDate,
                      });
                    }
                  }
                }
              }
            } else {
              //this condition suggests that is item is overstocked first time this month
              if (currentDate.getMonth() === i)
                arrTopush.push({
                  count: 1,
                  date: currentDate,
                });
              else {
                arrTopush.push({
                  count: ovItem.count || 0,
                  date: null,
                });
              }
            }
          }
        });
      } else {
        //this condtion suggests that this item has no overtock history and overstocked first time
        for (let i = 0; i <= 11; i++) {
          const date = new Date();
          if (date.getMonth() === i) {
            arrTopush.push({
              count: 1,
              date,
            });
          } else {
            arrTopush.push({
              count: 0,
              date: null,
            });
          }
        }
      }

      const primise = Inventory.update(
        { _id: item._id },
        {
          $set: {
            overStockTrack: arrTopush,
          },
        }
      );
      promises.push(primise);
    });
    stocks.understockItems.forEach((item) => {
      let arrTopush = [];
      if (item.underStockTrack) {
        item.underStockTrack.forEach((ovItem, i) => {
          ///checking if arrTopush length is less then 12.
          if (arrTopush.length < 12) {
            const currentDate = new Date(); //current date

            //we have two fields in ovItem 1. Date 2. Count
            //1. Date => Tells when the product was understocked last time. If null then it is considered as normal condition where item is niether understocked nor understocked
            //2. Count => Count can either be 1 or 0. 1 means that item is currently understocked and 0 means item is not understocked.

            if (ovItem?.date) {
              //checking if date is null or not. If date is null it means item is understocked first time
              let date = new Date(ovItem.date);
              // console.log("iteration",i,"year",date.getFullYear(),"===",currentDate.getFullYear(),"month",date.getMonth(),"===",currentDate.getMonth())
              const sameMonth = date.getMonth() === currentDate.getMonth();
              if (date.getFullYear() === currentYear) {
                //this condition says that the year is same
                arrTopush.push({
                  count: sameMonth ? 1 : ovItem.count,
                  date: currentDate, //adding current date becuase we want to make track of item last overstock time
                });
              } else {
                // this conditions says that year is not same
                // Now we will pop first element of overstocktrack and and push a new element with new month and year
                // push 12 elements in arrTopush
                if (sameMonth) {
                  //only run this loop when months are same and year is different
                  for (let i = 0; i < 12; i++) {
                    let date = item.underStockTrack[i]?.date;
                    if (
                      i === 12 &&
                      date &&
                      date.getFullYear() !== currentDate.getFullYear()
                    ) {
                      arrTopush({
                        count: 1,
                        date: currentDate,
                      });
                    } else {
                      let nextElemCount = item.underStockTrack[i + 1]?.count;
                      const newDate = moment(date).add("1", "month");
                      arrTopush.push({
                        count: nextElemCount,
                        date: newDate,
                      });
                    }
                  }
                }
              }
            } else {
              //this condition suggests that is item is understocked first time this month
              if (currentDate.getMonth() === i)
                arrTopush.push({
                  count: 1,
                  date: currentDate,
                });
              else {
                arrTopush.push({
                  count: ovItem.count || 0,
                  date: null,
                });
              }
            }
          }
        });
      } else {
        for (let i = 0; i <= 11; i++) {
          const date = new Date();
          if (date.getMonth() === i) {
            arrTopush.push({
              count: 1,
              date,
            });
          } else {
            arrTopush.push({
              count: 0,
              date: null,
            });
          }
        }
      }
      const primise = Inventory.update(
        { _id: item._id },
        {
          $set: {
            underStockTrack: arrTopush,
          },
        }
      );
      promises.push(primise);
    });
    const result = await Promise.all(promises);
    // }
    //     else{
    //       console.log("Year changed");
    //  await   Inventory.updateMany({},{
    //       $set:{
    //         underStockTrack: stockTrackInitialArray,
    //         overStockTrack: stockTrackInitialArray
    //       }
    //     })
    //     }

    ///checking year change
  } catch (error) {
    console.log(error);
  }

  console.log("Completed checking stocks")
};
export default checkStock;
