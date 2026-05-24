import { Routes } from '@angular/router';
import { anonymousOnlyGuard, authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [anonymousOnlyGuard],
    loadComponent: () =>
      import('./auth/pages/login-page/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'register',
    canActivate: [anonymousOnlyGuard],
    loadComponent: () =>
      import('./auth/pages/register-page/register-page.component').then(
        (m) => m.RegisterPageComponent,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/pages/dashboard-page/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
  },
  {
    path: 'pay-schedule',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pay-schedule/pages/pay-schedule-setup-page/pay-schedule-setup-page.component').then(
        (m) => m.PayScheduleSetupPageComponent,
      ),
  },
  {
    path: 'fixed-expenses',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./fixed-expenses/pages/fixed-expense-list-page/fixed-expense-list-page.component').then(
        (m) => m.FixedExpenseListPageComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
