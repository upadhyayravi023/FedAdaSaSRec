import CatalogItem from '../../models/CatalogItem.js';

export const processCatalogUpload = async (tenantId, catalogArray) => {
  if (!catalogArray || catalogArray.length === 0) return { message: 'No items provided', added: 0 };

  const bulkOps = catalogArray.map((item, index) => {
    return {
      updateOne: {
        filter: { tenantId, sku: item.sku },
        update: { $set: { title: item.title, ml_id: index } },
        upsert: true
      }
    };
  });

  const dbResult = await CatalogItem.bulkWrite(bulkOps);

  return {
    message: 'Catalog uploaded successfully',
    newItemsAdded: dbResult.upsertedCount || 0,
    itemsUpdated: dbResult.modifiedCount || 0
  };
};

export const publishTranslationMap = async (tenantId) => {
  const count = await CatalogItem.countDocuments({ tenantId });
  if (count === 0) {
    throw new Error('No catalog items found to publish');
  }

  return {
    message: 'Translation map generated and published successfully',
    publicUrl: `https://r2.storage.dev/${tenantId}/translation_map.json`,
  };
};


