import faker from "faker";
import { sumBy, orderBy } from "lodash";
import Inventory from "../models/master-listing";
import Users from "../models/users";
const mocker = (inventoryData) => {
  console.log("mocker");
  const activeProducts = faker.datatype.number(200, 350);
  const inactiveProducts = faker.datatype.number(180);
  const totalProducts = faker.datatype.number(500, 800);
  let shuffled = inventoryData.sort(() => 0.5 - Math.random());
  let purchaseOrders = [];
  for (let i = 0; i < 12; i++) {
    purchaseOrders[i] = {
      name: `${faker.datatype.number()}`,
      _id: faker.datatype.uuid(),
      purchaseordershipmentitems: [
        {
          unitsToShip: faker.datatype.number(150000),
          costPerUnits: faker.datatype.number(150000),
        },
      ],
    };
    let unitsToShip = sumBy(
      purchaseOrders[i]?.purchaseordershipmentitems,
      function (o) {
        return parseFloat(o.unitsToShip);
      }
    );
    let costPerUnits = sumBy(
      purchaseOrders[i]?.purchaseordershipmentitems,
      function (o) {
        return parseFloat(o.costPerUnits);
      }
    );
    purchaseOrders[i].unitsToShipTotal = unitsToShip;
    purchaseOrders[i].costPerUnitsTotal = costPerUnits;
  }
  let POGraphLabels = purchaseOrders.map((item) => `PO# ${item.name}`);
  let POGraphSeries = purchaseOrders.map((item) => item.costPerUnitsTotal);
  let unitsToShipTotal = sumBy(purchaseOrders, function (o) {
    return o.unitsToShipTotal;
  });
  let costPerUnitsTotal = sumBy(purchaseOrders, function (o) {
    return o.costPerUnitsTotal;
  });
  let totalInventory = inventoryData.length;
  let totalInventoryPrice = faker.datatype.number(150000);
  let totalOrders = faker.datatype.number(150);
  let unitsSold = faker.datatype.number(30000);
  let totalUnShippedOrders = faker.datatype.number(1500);
  let costOfGoodsSold = faker.datatype.number(1500000);
  let revenue = faker.datatype.number(15000000);
  let activePurchaseOrder = faker.datatype.number(30);
  let bestSellers = [];

  for (let i = 0; i < 10; i++) {
    let name =
      shuffled[i]?.name?.length > 42
        ? `${shuffled[i]?.name?.slice(0, 42)}...`
        : shuffled[i]?.name;
    bestSellers[i] = {
      name: name || faker.commerce.productName(),
      _id: faker.datatype.uuid(),
      unitsSold: faker.datatype.number(1200),
    };
  }
  bestSellers = orderBy(bestSellers, "unitsSold", ["desc"], ["desc"]);
  bestSellers.forEach((x, index) => {
    x.serial = index + 1;
  });

  let tov = [];
  let usp = [];

  shuffled = inventoryData.sort(() => 0.5 - Math.random());
  for (let i = 0; i < 5; i++) {
    let name =
      shuffled[i]?.name?.length > 42
        ? `${shuffled[i]?.name?.slice(0, 42)}...`
        : shuffled[i]?.name;
    tov[i] = {
      _id: faker.datatype.uuid(),
      averageDailySales: faker.datatype.number(150000),
      costPerUnit: faker.datatype.number(150000),
      name: name || faker.commerce.productName(),
      overStockedCost: faker.datatype.number(150000),
      overStockedRetail: faker.datatype.number(150000),
      overStockedVariants: faker.datatype.number(50),
      quantity: faker.datatype.number(150000),
      replenish: faker.datatype.number(1200),
      retail: faker.datatype.number(150000),
    };
  }
  shuffled = inventoryData.sort(() => 0.5 - Math.random());
  for (let i = 0; i < 5; i++) {
    let name =
      shuffled[i]?.name?.length > 42
        ? `${shuffled[i]?.name?.slice(0, 42)}...`
        : shuffled[i]?.name;
    usp[i] = {
      _id: faker.datatype.uuid(),
      averageDailySales: faker.datatype.number(150000),
      costPerUnit: faker.datatype.number(150000),
      name: name || faker.commerce.productName(),
      overStockedCost: faker.datatype.number(150000),
      overStockedRetail: faker.datatype.number(150000),
      overStockedVariants: faker.datatype.number(50),
      quantity: faker.datatype.number(150000),
      replenish: faker.datatype.number(1200),
      retail: faker.datatype.number(150000),
    };
  }
  let overStocked = {
    overStockedVariants: faker.datatype.number(50),
    overStockedRetail: faker.datatype.number(300000),
    overStockedCost: faker.datatype.number(900000),
  };
  let uspSorted = orderBy(usp, "overStockedVariants", ["desc"], ["asc"]);
  let tovSorted = orderBy(tov, "overStockedVariants", ["desc"], ["desc"]);

  usp = uspSorted.slice(0, 5);
  tov = tovSorted.slice(0, 5); //top overstocked variants
  let forcastSalesData = [];
  let forcastRevenueData = [];
  for (let ffd = 0; ffd < 7; ffd++) {
    let fakerYear = faker.date.between("2015-01-01", "2015-01-05");
    forcastSalesData.push({
      year: fakerYear,
      sales: faker.datatype.number(150000),
    });
    forcastRevenueData.push({
      year: fakerYear,
      revenue: faker.datatype.number(150000),
    });
  }
  let forecast = {
    forecastSales: faker.datatype.number(150000),
    forecastRevenue: faker.datatype.number(150000),
    forecastGraphSeries: [
      {
        name: "Sales",
        data: [
          faker.datatype.number(150000),
          faker.datatype.number(150000),
          faker.datatype.number(150000),
          faker.datatype.number(150000),
          faker.datatype.number(150000),
          faker.datatype.number(150000),
          faker.datatype.number(150000),
        ],
      },
      {
        name: "Revenue",
        data: [
          faker.datatype.number(150000),
          faker.datatype.number(150000),
          faker.datatype.number(150000),
          faker.datatype.number(150000),
          faker.datatype.number(150000),
          faker.datatype.number(150000),
          faker.datatype.number(150000),
        ],
      },
    ],
    forcastSalesData,
    forcastRevenueData,
  };
  let bestSellersChart = [];
  for (let i = 0; i < 10; i++) {
    bestSellersChart.push({
      count: `${i + 1}`,
      unitsSold: faker.datatype.number(150),
      name: faker.datatype.number(150),
    });
  }

  return {
    activeProducts,
    inactiveProducts,
    totalProducts,
    POGraphLabels,
    POGraphSeries,
    unitsToShipTotal,
    costPerUnitsTotal,
    totalInventory,
    totalInventoryPrice,
    totalOrders,
    unitsSold,
    totalUnShippedOrders,
    costOfGoodsSold,
    revenue,
    bestSellers,
    usp,
    tov,
    overStocked,
    forecast,
    activePurchaseOrder,
    bestSellersChart,
  };
};

export default mocker;
