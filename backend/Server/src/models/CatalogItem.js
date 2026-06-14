import mongoose from 'mongoose';

const catalogItemSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    ml_id: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a tenant can't have duplicate SKUs
catalogItemSchema.index({ tenantId: 1, sku: 1 }, { unique: true });
// Index on ml_id for mapping efficiency
catalogItemSchema.index({ tenantId: 1, ml_id: 1 });

const CatalogItem = mongoose.model('CatalogItem', catalogItemSchema);
export default CatalogItem;
