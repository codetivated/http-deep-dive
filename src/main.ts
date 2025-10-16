import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import {
  HttpHandlerFn,
  HttpRequest,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

function loggerInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  console.log('HTTP Request:', req);
  return next(req);
}

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withInterceptors([loggerInterceptor]))],
}).catch((err) => console.error(err));

// example of modifying request headers
// function loggerInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
//   const request = req.clone({
//     headers: req.headers.set('X-DEBUG', 'TESTING'),
//   });
//   console.log('HTTP Request:', request);
//   return next(request);
// }
