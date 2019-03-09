import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { AuthGuard } from './core/auth.guard';

export const AppRoutes: Routes = [
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    canActivate: [AuthGuard]
    }, {
      path: '',
      component: AdminLayoutComponent,
    canActivate: [AuthGuard],
      children: [
          {
        path: '',
        loadChildren: './dashboard/dashboard.module#DashboardModule'
    }, {
        path: 'problems',
        loadChildren: './problems/problems.module#ProblemsModule'
    }
  ]}, {
        path: 'auth',
      component: AuthLayoutComponent,
      children: [{
        path: '',
        loadChildren: './auth/auth.module#AuthModule'
      }]
    }
];
