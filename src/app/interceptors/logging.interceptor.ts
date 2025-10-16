import {
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('➡️ HTTP Request:', req);

    return next.handle(req).pipe(
      tap({
        next: (event) => {
          if (event.type === HttpEventType.Response) {
            console.log('✅ HTTP Response:', event);
            console.log('📦 Response Body:', event.body);
          }
        },
        error: (error) => {
          console.error('❌ HTTP Error:', error);
        },
      })
    );
  }
}
