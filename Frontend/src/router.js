import { Api } from './api.js';
import { LoginView } from './views/LoginView.js';
import { DashboardView } from './views/DashboardView.js';

export const Router = {
  routes: {
    '#/login': LoginView,
    '#/dashboard': DashboardView,
  },

  navigate(path) {
    window.location.hash = path;
  },

  async handleRoute() {
    const hash = window.location.hash || '#/login';
    const appElement = document.getElementById('app');
    
    const isAuthenticated = !!Api.getToken();
    
    if (!isAuthenticated && hash !== '#/login') {
      window.location.hash = '#/login';
      return;
    }
    
    if (isAuthenticated && hash === '#/login') {
       window.location.hash = '#/dashboard';
       return;
    }

    const component = this.routes[hash] || this.routes['#/login'];
    
    appElement.innerHTML = component.render();
    
    if (component.attachEvents) {
      component.attachEvents(this);
    }
  },

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }
};
