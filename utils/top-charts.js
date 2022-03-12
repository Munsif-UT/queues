import { replenishByTerms } from "../enumerations";

export const checkReplenishBy = (item, velocity) => {
  let fbaBufferStockMinReal =
    item?.calculationVariables?.fbaBufferStockMin ?? 0;
  let fbaBufferStockMin = fbaBufferStockMinReal + 7;
  let fbaMaxStock = item?.calculationVariables?.fbaMaxStock ?? 0;
  //  - if min buffer stock is 61 days than notify user before 7 days which is from 68th day to 61st day.
  let fbaDays = Math.round(item.totalInventory / velocity);

  let response = "";
  if (fbaDays > fbaBufferStockMin) {
    response = replenishByTerms.Above;
  }
  if (fbaDays <= fbaBufferStockMinReal) {
    response = replenishByTerms.Below;
  }
  if (fbaDays > fbaBufferStockMin && fbaDays < fbaMaxStock) {
    response = replenishByTerms.InStock;
  }
  if (fbaDays < fbaBufferStockMin && fbaDays > fbaBufferStockMinReal) {
    response = replenishByTerms.InBetween;
  }
  return response;
};
export const getReorderPoint = (item, velocity) => {
  let maxStockInUnits = item?.calculationVariables?.fbaMaxStock * velocity;
  let reorderPoint = maxStockInUnits - item.totalInventory;
  return reorderPoint.toFixed(0);
};
export const isNaN = (number) => {
  if (number === NaN) return true;
  return false;
};

export const isUnderStock = (item) => {
  const velocity =
    item?.velocity?.type === "manualVelocity"
      ? item?.velocity?.manualVelocity
      : getRate(
          item?.velocityDurationsPerProduct || [],
          item?.calculationVariables?.velocityDurations
        );
  const checkReplenishByVar = checkReplenishBy(item, velocity);
  return checkReplenishByVar === replenishByTerms.Below ? true : false;
};

export const isOverstock = (item, fbaDays) => {
  return fbaDays > item?.calculationVariables?.fbaMaxStock;
};

export const getFBADays = (totalInventory, velocity) => {
  let fbaDays = Math.round(totalInventory / velocity);
  return fbaDays
    ? fbaDays === "0"
      ? "Stockout"
      : fbaDays === Infinity
      ? "∞"
      : fbaDays
    : "Stockout";
};
export const getSum = (
  array,
  durations = [
    "twoDays",
    "sevenDays",
    "fifteenDays",
    "thirtyDays",
    "sixtyDays",
    "ninetyDays",
    "oneEightyDays",
  ]
) => {
  let sum = 0;

  for (let vel of durations) {
    if (array.hasOwnProperty(vel)) {
      sum = sum + array[vel].count / array[vel].days;
    }
  }

  return isNaN(sum) ? 0 : sum.toFixed(2);
};

export const getRate = (
  array,
  durations = [
    "twoDays",
    "sevenDays",
    "fifteenDays",
    "thirtyDays",
    "sixtyDays",
    "ninetyDays",
    "oneEightyDays",
  ]
) => {
  return getSum(array, durations) / durations?.length ?? 7;
};
export const fbaDaysTd = (item) => {
  let fbaDays = getFBADays(
    item?.totalInventory ?? 0,
    item?.velocity?.type === "manualVelocity"
      ? item?.velocity?.manualVelocity
      : getRate(
          item?.velocityDurationsPerProduct || [],
          item?.calculationVariables?.velocityDurations
        )
  );
  return fbaDays;
};
export const isStockout = (item)=>{
  let fbaDays = getFBADays(
    item?.totalInventory ?? 0,
    item?.velocity?.type === "manualVelocity"
      ? item?.velocity?.manualVelocity
      : getRate(
          item?.velocityDurationsPerProduct || [],
          item?.calculationVariables?.velocityDurations
        )
  );
  if(fbaDays === "Stockout" || fbaDays == "0"){
    return true
  }
  return false
}
export const getOverUnderStockItems = (array) =>{
  let overstockItems = [];
  let understockItems = [];
  array.forEach((item, i) => {
    const _fbaDays = fbaDaysTd(item);
    const velocity =
      item?.velocity?.type === "manualVelocity"
        ? item?.velocity?.manualVelocity
        : getRate(
            item?.velocityDurationsPerProduct || [],
            item?.calculationVariables?.velocityDurations
          );
    const replinishQuantity = getReorderPoint(item, velocity);

    if (_fbaDays) {
      if (isOverstock(item, _fbaDays)) {
        item._fbaDays = _fbaDays;
        item.prodVelocity = velocity;
        overstockItems.push(item);
      } else if (isUnderStock(item)) {
        item._fbaDays = _fbaDays;
        item.prodVelocity = velocity;
        item.replinishQuantity = replinishQuantity;
        understockItems.push(item);
      }
    }
  });
  return {
    overstockItems,
    understockItems
  }
}