import { Api } from '../api.js';

export const DashboardView = {
  render() {
    return `
      <div class="container">
        <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem;">
          <div>
            <h1 class="gradient-text" style="font-size: 2.5rem; margin-bottom: 0.5rem;" id="workspace-name">Control Center</h1>
            <p class="text-secondary">Federated Learning Network Operations</p>
          </div>
          <button id="logout-btn" class="btn btn-outline">Sign Out</button>
        </header>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
          <div class="glass-panel">
            <h3 class="text-secondary" style="font-size: 0.875rem; text-transform: uppercase;">Total Gradients Synced</h3>
            <div id="metric-gradients" class="gradient-text" style="font-size: 3rem; font-weight: 700; margin-top: 0.5rem;">
              <div class="skeleton" style="height: 3rem; width: 50%;"></div>
            </div>
          </div>
          <div class="glass-panel">
            <h3 class="text-secondary" style="font-size: 0.875rem; text-transform: uppercase;">Active Plan Status</h3>
            <div id="metric-plan" style="font-size: 2rem; font-weight: 600; margin-top: 1rem; color: var(--success);">
              <div class="skeleton" style="height: 2rem; width: 60%;"></div>
            </div>
          </div>
        </div>

        <div class="glass-panel">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2>Active SDK API Keys</h2>
            <button id="generate-key-btn" class="btn btn-primary">Generate New Key</button>
          </div>
          
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>API Key Token</th>
                  <th style="width: 100px; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody id="keys-table-body">
                <tr>
                  <td colspan="2">
                    <div class="skeleton" style="height: 2rem; width: 100%; margin-bottom: 0.5rem;"></div>
                    <div class="skeleton" style="height: 2rem; width: 100%;"></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  async attachEvents(router) {
    const logoutBtn = document.getElementById('logout-btn');
    const generateBtn = document.getElementById('generate-key-btn');
    const tbody = document.getElementById('keys-table-body');

    logoutBtn.addEventListener('click', () => {
      Api.clearToken();
      router.navigate('#/login');
    });

    generateBtn.addEventListener('click', async () => {
      generateBtn.disabled = true;
      generateBtn.textContent = 'Generating...';
      try {
        await Api.keys.generate();
        await this.loadData();
      } catch (err) {
        alert('Failed to generate key: ' + err.message);
      } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate New Key';
      }
    });

    tbody.addEventListener('click', async (e) => {
      if (e.target.classList.contains('delete-key-btn')) {
        const keyId = e.target.dataset.id;
        if (confirm('Revolving this API key will immediately block all apps using it. Are you sure?')) {
          e.target.textContent = 'Revoking...';
          e.target.disabled = true;
          try {
            await Api.keys.revoke(keyId);
            await this.loadData();
          } catch (err) {
            alert('Failed to revoke key: ' + err.message);
            e.target.textContent = 'Revoke';
            e.target.disabled = false;
          }
        }
      }
    });

    try {
      const [profile, metrics] = await Promise.all([
        Api.auth.getMe(),
        Api.metrics.getSystemHealth()
      ]);
      
      document.getElementById('workspace-name').textContent = profile.companyName || profile.name || 'Workspace';
      document.getElementById('metric-gradients').textContent = metrics.totalGradients.toLocaleString();
      document.getElementById('metric-plan').textContent = metrics.planStatus.toUpperCase();
      
      await this.loadData();
    } catch (error) {
      if (error.message.includes('Token') || error.message.includes('Unauthorized')) {
        Api.clearToken();
        router.navigate('#/login');
      } else {
        console.error('Failed to load dashboard:', error);
      }
    }
  },

  async loadData() {
    const tbody = document.getElementById('keys-table-body');
    const data = await Api.keys.list();
    
    if (!data.apiKeys || data.apiKeys.length === 0) {
      tbody.innerHTML = '<tr><td colspan="2" class="text-secondary" style="text-align: center; padding: 2rem;">No active API keys found. Generate one to connect your models.</td></tr>';
      return;
    }

    tbody.innerHTML = data.apiKeys.map(key => `
      <tr>
        <td style="font-family: monospace; font-size: 1.1rem;">${key}</td>
        <td style="text-align: right;">
          <button class="btn btn-outline delete-key-btn" data-id="${key}" style="border-color: var(--error); color: var(--error); padding: 0.4rem 1rem;">Revoke</button>
        </td>
      </tr>
    `).join('');
  }
};
