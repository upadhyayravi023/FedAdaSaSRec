import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Tenant from '../../models/Tenant.js';
import TrainingJob from '../../models/TrainingJob.js';

export const loginTenant = async (email, password) => {
  const tenant = await Tenant.findOne({ email });
  if (!tenant) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, tenant.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { tenantId: tenant._id, email: tenant.email, role: 'admin' },
    process.env.JWT_SECRET || 'super_secret_key',
    { expiresIn: '24h' }
  );

  return {
    token,
    profile: {
      id: tenant._id,
      name: tenant.name,
      email: tenant.email,
      planStatus: tenant.planStatus,
    },
  };
};

export const generateApiKeyForTenant = async (tenantId) => {
  const randomString = crypto.randomBytes(32).toString('hex');
  const newApiKey = `sk_live_${randomString}`;

  await Tenant.findByIdAndUpdate(tenantId, {
    $push: { apiKeys: newApiKey },
  });

  return newApiKey;
};

export const getSystemHealthMetrics = async (tenantId) => {
  const totalGradients = await TrainingJob.countDocuments({ tenantId });
  const tenant = await Tenant.findById(tenantId);
  
  return {
    totalGradients,
    planStatus: tenant ? tenant.planStatus : 'unknown',
  };
};

