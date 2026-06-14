import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    planStatus: {
      type: String,
      default: 'Free',
    },
    apiKeys: [
      {
        type: String,
      },
    ],
    activeModelVersion: {
      type: String,
    },
    activeModelUrl: {
      type: String,
    },
    activeModelUpdatedAt: {
      type: Date,
    },
    currentModelVersion: {
      type: String,
      default: 'v1'
    },
    metrics: {
      dailyRecommendations: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

const Tenant = mongoose.model('Tenant', tenantSchema);
export default Tenant;
