export const role = Object.freeze({
    sAdmin: "sadmin",
    Admin: "admin",
    User: "user",
});

export const regions = Object.freeze({
    northAmericaRegion: "northAmerica",
    europeRegion: "europe",
    farEastRegion: "farEast",
});

export const channels = Object.freeze({
    shopify: "Shopify",
    amazon: "Amazon",
    shipStation: "ShipStation",
});

export const regionsCode = Object.freeze({
    northAmericaCode: "na",
    europeCode: "eu",
    farEastCode: "fe",
});

export const warehouseTypes = Object.freeze({
    FBA: "FBA",
    FBM: "FBM",
});

export const poStatuses = Object.freeze({
    partiallyReceived: "Partially Received",
    draft: "Draft",
    received: "Received",
});

export const taskTypes = Object.freeze({
    syncProduct: "sync_product",
    fetchProductsStatus: "fetchProductsStatus"
})
export const taskStatus = Object.freeze({
    CANCELLED: "CANCELLED",
    DONE: "DONE",
    IN_PROGRESS: "IN_PROGRESS"
})
export const reportType = Object.freeze({
    GET_MERCHANT_LISTINGS_ALL_DATA: "GET_MERCHANT_LISTINGS_ALL_DATA",
    GET_FBA_MYI_ALL_INVENTORY_DATA: "GET_FBA_MYI_ALL_INVENTORY_DATA",
    GET_RESERVED_INVENTORY_DATA: "GET_RESERVED_INVENTORY_DATA",
    GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL: 'GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL'
})

export const tokenTypes = Object.freeze({
    email_verification: "email_verification",
    forget_password: "forget_password",
})
export const replenishByTerms = Object.freeze({
    InStock: "InStock",
    InBetween: "InBetween",
    Below: "Below",
    Above: "Above",
});