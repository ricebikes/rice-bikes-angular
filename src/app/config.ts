import { environment } from './../environments/environment';

export let CONFIG;


export const user_inactivity = 20;
export const user_timeout =  10;

if (environment.production) {
  CONFIG = {
    api_url: 'http://ricebikesapp.rice.edu/api',
    cas_auth_url: 'https://idp.rice.edu/idp/profile/cas/login',
    service_url: 'http://ricebikesapp.rice.edu/auth',
  };
} else {
  CONFIG = {
    api_url: 'http://localhost:3000/api',
    cas_auth_url: 'https://idp.rice.edu/idp/profile/cas/login',
    service_url: 'http://localhost:4200/auth',
  };
}
