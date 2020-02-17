import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
  // disable console logs if in prod
  if (window) {
    window.console.log = function(){};
  }
}

platformBrowserDynamic().bootstrapModule(AppModule);
