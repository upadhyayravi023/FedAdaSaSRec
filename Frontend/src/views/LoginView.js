import { Api } from '../api.js';

export const LoginView = {
  render() {
    return `
      <div class="flex-center">
        <div class="glass-panel" style="width: 100%; max-width: 440px;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <h2 class="gradient-text" style="font-size: 2rem;">Admin Portal</h2>
            <p class="text-secondary" style="margin-top: 0.5rem;" id="form-subtitle">Sign in to your control center</p>
          </div>
          
          <form id="auth-form">
            <div id="register-fields" style="display: none;">
              <div class="input-group">
                <label for="companyName">WORKSPACE NAME</label>
                <input type="text" id="companyName" class="input-control" placeholder="Acme Corp" />
              </div>
            </div>
            
            <div class="input-group">
              <label for="email">SUPPORT EMAIL</label>
              <input type="email" id="email" class="input-control" placeholder="admin@domain.com" required />
            </div>
            
            <div class="input-group">
              <label for="password">ACCESS PASSWORD</label>
              <input type="password" id="password" class="input-control" placeholder="••••••••" required />
            </div>

            <div id="error-msg" class="text-error" style="display: none; margin-bottom: 1rem; text-align: center;"></div>
            
            <button type="submit" class="btn btn-primary btn-block" id="submit-btn" style="margin-top: 1rem;">Authenticate</button>
          </form>
          
          <div style="text-align: center; margin-top: 1.5rem;">
            <a href="#" class="text-secondary" id="toggle-mode" style="text-decoration: none; font-size: 0.875rem;">Need to register a tenant?</a>
          </div>
        </div>
      </div>
    `;
  },

  attachEvents(router) {
    const form = document.getElementById('auth-form');
    const toggleBtn = document.getElementById('toggle-mode');
    const registerFields = document.getElementById('register-fields');
    const submitBtn = document.getElementById('submit-btn');
    const subtitle = document.getElementById('form-subtitle');
    const errorMsg = document.getElementById('error-msg');
    
    let isRegisterMode = false;

    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      isRegisterMode = !isRegisterMode;
      
      if (isRegisterMode) {
        registerFields.style.display = 'block';
        submitBtn.textContent = 'Initialize Workspace';
        subtitle.textContent = 'Create a new federated learning tenant';
        toggleBtn.textContent = 'Already have an access key? Sign in';
      } else {
        registerFields.style.display = 'none';
        submitBtn.textContent = 'Authenticate';
        subtitle.textContent = 'Sign in to your control center';
        toggleBtn.textContent = 'Need to register a tenant?';
      }
      errorMsg.style.display = 'none';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const companyName = document.getElementById('companyName').value;
      
      submitBtn.textContent = 'Processing...';
      submitBtn.disabled = true;
      errorMsg.style.display = 'none';
      
      try {
        let res;
        if (isRegisterMode) {
          res = await Api.auth.register(companyName, email, password);
        } else {
          res = await Api.auth.login(email, password);
        }
        
        if (res.token) {
          Api.setToken(res.token);
          router.navigate('#/dashboard');
        }
      } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.style.display = 'block';
        submitBtn.textContent = isRegisterMode ? 'Initialize Workspace' : 'Authenticate';
        submitBtn.disabled = false;
      }
    });
  }
};
