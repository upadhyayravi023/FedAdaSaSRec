const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const Api = {
  getToken() {
    return localStorage.getItem('tenant_jwt');
  },

  setToken(token) {
    localStorage.setItem('tenant_jwt', token);
  },

  clearToken() {
    localStorage.removeItem('tenant_jwt');
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || data?.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  },

  auth: {
    async login(email, password) {
      return Api.request('/dashboard/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    },

    async register(companyName, email, password) {
      return Api.request('/dashboard/auth/register', {
        method: 'POST',
        body: JSON.stringify({ companyName, email, password })
      });
    },

    async getMe() {
      return Api.request('/dashboard/auth/me');
    }
  },

  keys: {
    async list() {
      return Api.request('/dashboard/keys');
    },

    async generate() {
      return Api.request('/dashboard/keys/generate', { method: 'POST' });
    },

    async revoke(keyId) {
      return Api.request(`/dashboard/keys/${keyId}`, { method: 'DELETE' });
    }
  },

  metrics: {
    async getSystemHealth() {
      return Api.request('/dashboard/metrics');
    }
  }
};
