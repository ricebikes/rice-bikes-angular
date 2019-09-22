import { environment } from './../environments/environment';

export let CONFIG;

if (environment.production) {
  CONFIG = {
    api_url: 'http://ricebikesapp.rice.edu/api',
    cas_auth_url: 'https://idp.rice.edu/idp/profile/cas/login',
    service_url: 'http://ricebikesapp.rice.edu/auth',
    user_inactivity: 110,
    user_timeout: 10
  };
} else {
  CONFIG = {
    api_url: 'http://localhost:3000/api',
    cas_auth_url: 'https://idp.rice.edu/idp/profile/cas/login',
    service_url: 'http://localhost:4200/auth',
    user_inactivity: 3,
    user_timeout: 10
  }
}
