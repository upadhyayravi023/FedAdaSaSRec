import * as catalogService from './services.js';
import CatalogItem from '../../models/CatalogItem.js';

export const uploadCatalog = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const catalogArray = req.body;
    
    const result = await catalogService.processCatalogUpload(tenantId, catalogArray);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Upload Catalog Error:', error);
    return res.status(500).json({ error: 'Internal server error', status: 500 });
  }
};

export const publishMap = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const result = await catalogService.publishTranslationMap(tenantId);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Publish Translation Map Error:', error);
    if (error.message.includes('No catalog items found')) {
      return res.status(400).json({ error: error.message, status: 400 });
    }
    return res.status(500).json({ error: 'Internal server error', status: 500 });
  }
};

export const getCatalogItems = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const items = await CatalogItem.find({ tenantId }).limit(50);
    return res.status(200).json({ items });
  } catch (error) {
    console.error('Get Catalog Items Error:', error);
    return res.status(500).json({ error: 'Internal server error', status: 500 });
  }
};

