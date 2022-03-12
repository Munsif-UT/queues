import { sumBy } from 'lodash';

import Inventory from '../models/master-listing';

const updateInventroyFields = async ({
  filter,
  tenantId,
  brands,
  tags,
  inventory,
  vendors,
  supplyChainTime,
  purchaseOrder,
}) => {
  const TenantInventory = Inventory.byTenant(tenantId);
  const bulkOperations = [];
  const populateQuery = [];
  if (brands) {
    populateQuery.push({
      path: 'brands',
      select: 'displayName brandName',
    });
  }
  if (tags) {
    populateQuery.push({
      path: 'tags',
    });
  }
  if (inventory) {
    populateQuery.push(
      ...[
        {
          path: 'child',
          select: 'name',
        },
        {
          path: 'inventoryLevels',
          populate: {
            path: 'wid',
            select: 'name color',
          },
        },
      ]
    );
  }
  if (supplyChainTime) {
    populateQuery.push(
      ...[
        {
          path: 'supplierPricing.suppliers.supplierId',
          populate: {
            path: 'supplyChainTimeId',
          },
          select: 'supplyChainTimeId color name',
        },
        {
          path: 'supplyChainTime.supplyChainTimeId',
        },
      ]
    );
  }
  if (vendors) {
    populateQuery.push(
      ...[
        {
          path: 'freightForwarder',
          select: 'name',
        },
        {
          path: 'prepCenter',
          select: 'name',
        },
      ]
    );
    if (!inventory) {
      populateQuery.push({
        path: 'inventoryLevels',
        populate: {
          path: 'wid',
          select: 'name color',
        },
      });
    }
    if (!supplyChainTime) {
      populateQuery.push({
        path: 'supplierPricing.suppliers.supplierId',
        populate: {
          path: 'supplyChainTimeId',
        },
        select: 'supplyChainTimeId color name',
      });
    }
  }
  const products = await TenantInventory.find(filter).populate(populateQuery);
  products.forEach((product) => {
    const table = product.table || {};
    if (brands) {
      table.brands = product.brands
        ? product.brands.map((brand) => brand.displayName || brand.brandName)
        : [];
    }
    if (tags) {
      table.tags = product.tags ? product.tags.map((tag) => tag.name) : [];
    }
    if (supplyChainTime) {
      const primarySupplier =
        product.supplierPricing.suppliers &&
        product.supplierPricing.suppliers.find((supplier) => supplier.primary);
      table.primarySupplier = primarySupplier;
      if (primarySupplier) {
        table.defaultLeadTime =
          primarySupplier.supplierId &&
          primarySupplier.supplierId.supplyChainTimeId &&
          primarySupplier.supplierId.supplyChainTimeId.status
            ? sumBy(primarySupplier.supplierId.supplyChainTimeId.status, 'days')
            : 0;
      } else {
        table.defaultLeadTime = 0;
      }
      table.leadTimePerMarket =
        product.supplyChainTime &&
        product.supplyChainTime.map((sct) => ({
          days: sct.supplyChainTimeId
            ? sumBy(sct.supplyChainTimeId.status, 'days')
            : table.defaultLeadTime,
          marketPlaces: sct.marketPlaces,
        }));
    }
    if (vendors) {
      if (!supplyChainTime) {
        table.primarySupplier =
          product.supplierPricing.suppliers &&
          product.supplierPricing.suppliers.find(
            (supplier) => supplier.primary
          );
      }
      const primarySupplier = table.primarySupplier;
      table.prepCenter = product.prepCenter.map((pc) => pc.name);
      table.freightForwarder = product.freightForwarder.map((ff) => ff.name);
      let totalWarehouseStock = 0;
      table.warehouseStock =
        product.inventoryLevels.map((il) => {
          totalWarehouseStock += il.quantity || 0;
          return {
            quantity: il?.quantity,
            name: il.wid?.name,
            color: il.wid?.color,
            wid: il.wid?._id,
          };
        }) || [];
      table.totalWarehouseStock = totalWarehouseStock;
      if (primarySupplier) {
        table.supplier =
          primarySupplier.supplierId && primarySupplier.supplierId.name;
        table.supplierColor =
          primarySupplier.supplierId && primarySupplier.supplierId.color;
      } else {
        table.supplier = null;
        table.supplierColor = null;
      }
    }
    if (purchaseOrder) {
      table.inboundToWarehouse = 0;
    }
    if (inventory) {
      if (!vendors || !supplyChainTime) {
        table.primarySupplier =
          product.supplierPricing.suppliers &&
          product.supplierPricing.suppliers.find(
            (supplier) => supplier.primary
          );
      }
      const primarySupplier = table.primarySupplier;
      let totalWarehouseStock = 0;
      if (!vendors) {
        product.inventoryLevels = product.inventoryLevels.filter(prod => prod.wid !== null)
        table.warehouseStock =
          product.inventoryLevels.map((il) => {
            totalWarehouseStock += il.quantity || 0;
            return {
              quantity: il.quantity,
              name: il.wid.name,
              color: il.wid.color,
              wid: il.wid._id,
            };
          }) || [];
        table.totalWarehouseStock = totalWarehouseStock;
      }
      if (primarySupplier) {
        table.costPerUnit = primarySupplier.costPerUnit || 0;
        table.estShippingCostPerUnit = primarySupplier.shippingCost || 0;
        table.costPerCarton =
          table.costPerUnit * (product.dimensionsAndSpecs.unitsPerCarton || 0);
        table.mpn = primarySupplier.manufacturerPartNumber;
        table.moq = primarySupplier.moq;
      } else {
        table.costPerUnit = 0;
        table.estShippingCostPerUnit = 0;
        table.costPerCarton = 0;
        table.mpn = null;
        table.moq = 0;
      }
      table.costPerPallet =
        table.costPerCarton *
        (product.dimensionsAndSpecs.cartonsPerPallet || 0);
      table.totalCogsPerUnit =
        table.costPerCarton * table.estShippingCostPerUnit;
      table.bundledItems = product.supplierPricing.bundleProduct
        ? product.supplierPricing.products
          ? product.supplierPricing.products.length
          : null
        : null;
      table.variations = product.child.length;
    }
    if (purchaseOrder || inventory) {
      table.totalWarehouseStock = table.totalWarehouseStock || 0;
      table.inboundToWarehouse = table.inboundToWarehouse || 0;
      table.costPerUnit = table.costPerUnit || 0;
      table.estShippingCostPerUnit = table.estShippingCostPerUnit || 0;
      table.totalWarehouseInbound =
        table.totalWarehouseStock + table.inboundToWarehouse;
      table.totalInStock = table.totalWarehouseStock;
      table.totalWarehouseInboundCartons = Math.floor(
        (table.totalWarehouseStock + table.inboundToWarehouse) /
          product.dimensionsAndSpecs.unitsPerCarton
      );
      table.totalInStockInbound =
        table.totalWarehouseStock + table.inboundToWarehouse;
      table.cogValue = table.costPerUnit * table.totalInStockInbound;
      table.estShippingValue =
        table.estShippingCostPerUnit * table.totalInStockInbound;
      table.totalValue = table.cogValue + table.estShippingValue;
    }
    bulkOperations.push({
      updateOne: {
        filter: {
          tenantId,
          _id: product._id,
        },
        update: {
          table,
        },
      },
    });
  });
  await TenantInventory.bulkWrite(bulkOperations);
};

export default updateInventroyFields;
