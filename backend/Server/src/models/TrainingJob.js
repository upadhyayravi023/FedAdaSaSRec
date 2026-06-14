import mongoose from 'mongoose';

const trainingJobSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    s3ObjectKey: {
      type: String,
    },
    gradientS3Url: {
      type: String,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['PENDING_UPLOAD', 'pending', 'processing', 'completed', 'failed'],
      default: 'PENDING_UPLOAD',
    },
  },
  { timestamps: true }
);

const TrainingJob = mongoose.model('TrainingJob', trainingJobSchema);
export default TrainingJob;
