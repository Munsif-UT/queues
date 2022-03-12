import { sumBy, concat, cloneDeep, first, isEmpty, orderBy } from "lodash"
import moment from "moment"

export const forecasting = (myInventory, params={}) => {
    // myInventory = myInventory.filter(item => item.orders.length > 0);
    // aggregation pipeline end
    let orders = [];
    myInventory.forEach(item => {
        orders = concat(orders, item.orders);
    });
    let maxDailySales = 0
    let velocityDurations = {
        twoDays: {
            startTime: moment().subtract(2, "days").endOf('day'),
            endTime: moment().startOf('day')
        },
        sevenDays: {
            startTime: moment().subtract(7, "days").endOf('day'),
            endTime: moment().startOf('day')
        },
        fifteenDays: {
            startTime: moment().subtract(15, "days").endOf('day'),
            endTime: moment().startOf('day')
        },
        thirtyDays: {
            startTime: moment().subtract(30, "days").endOf('day'),
            endTime: moment().startOf('day')
        },
        sixtyDays: {
            startTime: moment().subtract(60, "days").endOf('day'),
            endTime: moment().startOf('day')
        },
        ninetyDays: {
            startTime: moment().subtract(90, "days").endOf('day'),
            endTime: moment().startOf('day')
        },
        oneEightyDays: {
            startTime: moment().subtract(180, "days").endOf('day'),
            endTime: moment().startOf('day')
        }
    }
    let months = {
        startTime: moment().subtract(180, "days").endOf('day'),
        endTime: moment().startOf('day')
    }
    let velocityDurationsOrdersLength = {
        twoDays: {
            days: 2,
            count: 0,
            weight: 0,
        },
        sevenDays: {
            days: 7,
            count: 0,
            weight: 0,
        },
        fifteenDays: {
            days: 15,
            count: 0,
            weight: 0,
        },
        thirtyDays: {
            days: 30,
            count: 0,
            weight: 0,
        },
        sixtyDays: {
            days: 60,
            count: 0,
            weight: 0,
        },
        ninetyDays: {
            days: 90,
            count: 0,
            weight: 0
        },
        oneEightyDays: {
            days: 180,
            count: 0,
            weight: 0,
        },
    }
    let sixMonthOrders = []
    // get monthly dates from now to last month
    const listDate = [];
    const startDate = months.startTime.format('YYYY-MM-DD');
    const endDate = months.endTime.format('YYYY-MM-DD');
    const dateMove = new Date(startDate);
    let strDate = startDate;

    while (strDate < endDate) {
        strDate = dateMove.toISOString().slice(0, 10);
        listDate.push({
            date: moment(strDate),
            count: 0 //to Count the max daily sales
        });
        dateMove.setDate(dateMove.getDate() + 1);
    };
    // get monthly dates from now to last month
    orders.forEach(order => {
        if (order?.purchaseDate) {
            const purchaseDate = moment(order.purchaseDate)
            if (purchaseDate.isBetween(months.startTime, months.endTime)) {
                sixMonthOrders.push(order) //find orders in last month to shorten the loop for max Daily Sales
            }
        }
    });
    sixMonthOrders.forEach(order => {
        const purchaseDate = moment(order.purchaseDate);
        listDate.forEach(d => {
            if (purchaseDate.isSame(d.date, 'day')) {
                // find max daily sales in last Month
                d.count += parseInt(order.quantity);
            }
        });
    })
    maxDailySales = Math.max(...listDate.map(d => d.count))
    const anAsyncFunction = (item) => {
        let velocityDurationsPerProduct = cloneDeep(velocityDurationsOrdersLength)
        // let avgDailySales = 0;
        // let totalSalesPerYear = 0;
        item.orders?.forEach((order) => {
            // totalSalesPerYear += parseInt(order.quantity) //find total Sales Per Year
            for (let velo in velocityDurations) {
                if (order.purchaseDate) {
                    const purchaseDate = moment(order.purchaseDate);
                    if (purchaseDate.isBetween(velocityDurations[velo].startTime, velocityDurations[velo].endTime)) {
                        velocityDurationsPerProduct[velo].count += parseInt(order.quantity) || 0 //gathering data for velocity durations
                    }
                }
            }
        })

        // avgDailySales = item?.velocity?.type === "manualVelocity" ? item?.velocity?.manualVelocity : totalSalesPerYear / 365;

        let velocityDurationsPerProductSum = sumBy(Object.values(velocityDurationsPerProduct), function (o) { return o.count || 0 });
        let velocityDurationsPerProductAvg = velocityDurationsPerProductSum / 7
        let costOfGoodsSold = sumBy(item.orders, function (o) {
            return (o.itemPrice ? parseFloat(o.itemPrice) : 0 + o.itemTax ? parseFloat(o.itemTax) : 0) * o.quantity ? parseInt(o.quantity) : 0
        });
        let totalInventory = sumBy(item.wq, function (o) { return parseInt(o.quantity) || 0 });
        // Inventory Turnover Ratio = Cost of Goods Sold / Average Inventory        
        let inventoryTurnoverRatio = costOfGoodsSold / totalInventory;
        if (inventoryTurnoverRatio === 1 / 0) {
            inventoryTurnoverRatio = 0
        }   
        let supplyChainTimeId = item.leadTime;
        let leadTime = supplyChainTimeId ? sumBy(supplyChainTimeId.status, 'days') : 60;
        // let safetyStock = (maxDailySales * leadTime) - (avgDailySales * leadTime)
        // let leadTimeDemand = leadTime * avgDailySales;
        let totalOrders = item.orders?.length ?? 0;

        let data = {
            totalInventory,
            totalOrders,
            leadTime,
            supplyChainTimeId,
            inventoryTurnoverRatio: inventoryTurnoverRatio.toFixed(3),
            // avgDailySales: avgDailySales.toFixed(3), 
            // totalSalesPerYear, 
            maxDailySales
        }
        return {
            ...item,
            ...data,
            velocityDurationsPerProduct,
            velocityDurationsPerProductAvg: velocityDurationsPerProductAvg.toFixed(2),
            velocityDurationsPerProductSum,
        }
    };
    myInventory = myInventory.map((item) => anAsyncFunction(item))
    let sortingArray = ['fbaDays'];
    let sortingTypeArray = ['asc'];
    if (!isEmpty(params?.sortColumn)) {
        sortingArray = [params?.sortColumn]
        sortingTypeArray = [params?.sortType]
    }
    myInventory = orderBy(myInventory, sortingArray, sortingTypeArray)
    return myInventory;
}