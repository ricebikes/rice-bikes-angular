import { environment } from './../environments/environment';

export let CONFIG;

if (environment.production) {
  CONFIG = {
    api_url: 'https://ricebikes.ml/api',
    cas_auth_url: 'https://idp.rice.edu/idp/profile/cas/login',
    service_url: 'https://ricebikes.ml/auth'
  }
} else {
  CONFIG = {
    api_url: 'http://localhost:3000/api',
    cas_auth_url: 'https://idp.rice.edu/idp/profile/cas/login',
    service_url: 'http://localhost:4200/auth'
  }
}
