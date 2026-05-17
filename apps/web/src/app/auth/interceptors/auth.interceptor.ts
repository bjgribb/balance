import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthRefreshService } from '../services/auth-refresh.service';
import { AuthSessionService } from '../services/auth-session.service';

const retriedRequestHeader = 'X-Auth-Retry';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authSession = inject(AuthSessionService);
  const authRefresh = inject(AuthRefreshService);
  const router = inject(Router);

  const shouldSkipAuth =
    !request.url.startsWith(environment.apiBaseUrl) ||
    request.url.includes('/api/auth/login') ||
    request.url.includes('/api/auth/register') ||
    request.url.includes('/api/auth/refresh');

  const accessToken = authSession.getAccessToken();
  const authorizedRequest =
    !shouldSkipAuth && accessToken
      ? request.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      : request;

  return next(authorizedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      const alreadyRetried = authorizedRequest.headers.has(retriedRequestHeader);
      const canRetry =
        !shouldSkipAuth && error.status === 401 && !alreadyRetried && authSession.hasRefreshToken();

      if (!canRetry) {
        return throwError(() => error);
      }

      return authRefresh.refresh().pipe(
        switchMap((response) => {
          authSession.setSession(response);

          const retryToken = authSession.getAccessToken();
          if (!retryToken) {
            authSession.clearSession();
            void router.navigateByUrl('/login');
            return throwError(() => error);
          }

          const retried = request.clone({
            setHeaders: {
              Authorization: `Bearer ${retryToken}`,
              [retriedRequestHeader]: 'true',
            },
          });

          return next(retried);
        }),
        catchError((refreshError) => {
          authSession.clearSession();
          void router.navigateByUrl('/login');
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
