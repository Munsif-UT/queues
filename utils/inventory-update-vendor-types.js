import Vendors from '../models/vendors';
import Inventory from '../models/master-listing';
import WarehouseQuantities from '../models/warehouse-quantities';
import updateProductTable from './update-inventory-field';

const inventoryUpdateOnVendorTypes = async (
  {
    supplierRemove = false,
    warehouseRemove = false,
    prepCenterRemove = false,
    freightForwarderRemove = false,
    vendorEdit = false,
  },
  vendorIds,
  tenantId
) => {
  const TenantVendors = Vendors.byTenant(tenantId || 'some-tenant-ids');
  const TenantInventory = Inventory.byTenant(tenantId || 'some-tenant-ids');
  const TenantWarehouseQuantities = WarehouseQuantities.byTenant(
    tenantId || 'some-tenant-ids'
  );
  let inventoryLevels = null;
  let sctUpdateTable = vendorEdit;
  let inventoryUpdateTable = false;
  let vendorUpdateTable = vendorEdit;
  const inventoryFilterOr = [];
  const bulkOperationInventory = [];
  const bulkOperationVendor = [];
  const productIds = [];
  if (supplierRemove) {
    inventoryFilterOr.push({
      'supplierPricing.suppliers.supplierId': { $in: vendorIds },
    });
  }
  if (prepCenterRemove) {
    inventoryFilterOr.push({
      prepCenter: { $in: vendorIds },
    });
  }
  if (freightForwarderRemove) {
    inventoryFilterOr.push({
      freightForwarder: { $in: vendorIds },
    });
  }
  const products = inventoryFilterOr.length
    ? await TenantInventory.find({ $or: inventoryFilterOr })
    : [];
  if (products.length) {
    JSON.parse(JSON.stringify(products)).forEach((product) => {
      let {
        prepCenter,
        freightForwarder,
        supplierPricing: { suppliers },
        supplyChainTime,
      } = product;
      productIds.push(product._id);
      if (supplierRemove) {
        if (suppliers && suppliers.length) {
          suppliers = suppliers.filter(
            (supplier) => !vendorIds.includes(supplier.supplierId)
          );
          const primarySupplier = suppliers.find(
            (supplier) => supplier.primary
          );
          if (!primarySupplier && suppliers.length) {
            const marketPlaces = [];
            supplyChainTime.forEach((sct) =>
              marketPlaces.push(...sct.marketPlaces)
            );
            suppliers[0].primary = true;
            vendorUpdateTable = true;
            sctUpdateTable = true;
            inventoryUpdateTable = true;
            supplyChainTime = [
              {
                marketPlaces,
                supplierId: suppliers[0].supplierId,
                supplyChainTimeId: null,
              },
            ];
            bulkOperationVendor.push({
              updateOne: {
                filter: {
                  tenantId,
                  _id: suppliers[0].supplierId,
                },
                update: {
                  $inc: { 'products.supplier': 1 },
                },
              },
            });
          } else if (!primarySupplier) {
            supplyChainTime = null;
            suppliers = null;
            vendorUpdateTable = true;
            sctUpdateTable = true;
            inventoryUpdateTable = true;
          }
        }
      }
      if (prepCenterRemove) {
        vendorUpdateTable = true;
        prepCenter = prepCenter.filter((id) => !vendorIds.includes(id));
      }
      if (freightForwarderRemove) {
        vendorUpdateTable = true;
        freightForwarder = freightForwarder.filter(
          (id) => !vendorIds.includes(id)
        );
      }
      bulkOperationInventory.push({
        updateOne: {
          filter: {
            tenantId,
            _id: product._id,
          },
          update: {
            prepCenter,
            freightForwarder,
            'supplierPricing.suppliers': suppliers,
            supplyChainTime,
          },
        },
      });
    });
  }
  if (bulkOperationInventory.length) {
    await TenantInventory.bulkWrite(bulkOperationInventory);
  }
  if (warehouseRemove) {
    inventoryLevels = await TenantWarehouseQuantities.find({
      wid: { $in: vendorIds },
    });
    productIds.push(...inventoryLevels.map((il) => il.mlid));
    const result = await TenantWarehouseQuantities.deleteMany({
      wid: { $in: vendorIds },
    });
    if (result.deletedCount) {
      inventoryUpdateTable = true;
      vendorUpdateTable = true;
    }
  }
  if (bulkOperationVendor.length) {
    await TenantVendors.bulkWrite(bulkOperationVendor);
  }
  if (productIds.length || vendorEdit) {
    if (!inventoryLevels && vendorEdit) {
      inventoryLevels = await TenantWarehouseQuantities.find({
        wid: { $in: vendorIds },
      });
      productIds.push(...inventoryLevels.map((il) => il.mlid));
    }
    let filter = { $or: [{ _id: { $in: productIds } }] };
    if (vendorEdit) {
      filter.$or.push(
        ...[
          {
            'supplierPricing.suppliers.supplierId': { $in: vendorIds },
          },
          {
            prepCenter: { $in: vendorIds },
          },
          {
            freightForwarder: { $in: vendorIds },
          },
        ]
      );
    }
    await updateProductTable({
      filter,
      supplyChainTime: sctUpdateTable,
      vendors: vendorUpdateTable,
      inventory: inventoryUpdateTable,
      tenantId,
    });
  }
};

export default inventoryUpdateOnVendorTypes;
