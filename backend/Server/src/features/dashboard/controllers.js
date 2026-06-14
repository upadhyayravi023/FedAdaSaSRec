import * as dashboardService from './services.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Tenant from '../../models/Tenant.js';

export const register = async (req, res) => {
  try {
    const { companyName, email, password } = req.body;

    const existingTenant = await Tenant.findOne({ email });
    if (existingTenant) {
      return res.status(400).json({ error: 'Tenant with this email already exists', status: 400 });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newTenant = await Tenant.create({
      companyName,
      name: companyName,
      email,
      passwordHash,
      planStatus: 'Free',
      apiKeys: []
    });

    const token = jwt.sign(
      { tenantId: newTenant._id, email: newTenant.email, role: 'admin' },
      process.env.JWT_SECRET || 'super_secret_key',
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      token,
      profile: {
        id: newTenant._id,
        companyName: newTenant.companyName || newTenant.name,
        email: newTenant.email,
        planStatus: newTenant.planStatus
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Internal server error', status: 500 });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await dashboardService.loginTenant(email, password);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: error.message, status: 401 });
    }
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Internal server error', status: 500 });
  }
};

export const generateApiKey = async (req, res) => {
  try {
    const tenantId = req.user.tenantId; 
    const newApiKey = await dashboardService.generateApiKeyForTenant(tenantId);
    return res.status(201).json({ message: 'API Key generated successfully', apiKey: newApiKey });
  } catch (error) {
    console.error('Generate API Key Error:', error);
    return res.status(500).json({ error: 'Failed to generate API Key', status: 500 });
  }
};

export const listApiKeys = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const tenant = await Tenant.findById(tenantId).select('apiKeys');
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found', status: 404 });
    }

    return res.status(200).json({ apiKeys: tenant.apiKeys || [] });
  } catch (error) {
    console.error('List API Keys Error:', error);
    return res.status(500).json({ error: 'Failed to fetch API keys', status: 500 });
  }
};

export const getMetrics = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const metrics = await dashboardService.getSystemHealthMetrics(tenantId);
    return res.status(200).json(metrics);
  } catch (error) {
    console.error('Get Metrics Error:', error);
    return res.status(500).json({ error: 'Failed to fetch metrics', status: 500 });
  }
};

export const getMe = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const tenant = await Tenant.findById(tenantId).select('-passwordHash');
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    return res.status(200).json(tenant);
  } catch (error) {
    console.error('Get Me Error:', error);
    return res.status(500).json({ error: 'Internal server error', status: 500 });
  }
};

export const deleteApiKey = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { keyId } = req.params;
    
    await Tenant.findByIdAndUpdate(tenantId, { $pull: { apiKeys: keyId } });
    return res.status(200).json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Delete API Key Error:', error);
    return res.status(500).json({ error: 'Internal server error', status: 500 });
  }
};


