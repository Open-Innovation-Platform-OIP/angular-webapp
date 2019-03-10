import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { AuthGuard } from './services/auth.guard';
import { GlobalSearchViewComponent } from "./global-search-view/global-search-view.component";
export const AppRoutes: Routes = [
    {
      path: '',
      redirectTo: 'problems',
      pathMatch: 'full',
    canActivate: [AuthGuard]
    }, {
      path: '',
      component: AdminLayoutComponent,
    canActivate: [AuthGuard],
      children: [
    //       {
    //     path: '',
    //       loadChildren: './problems/problems.module#ProblemsModule'
    //     // loadChildren: './dashboard/dashboard.module#DashboardModule'
    // }, 
    {
        path: 'problems',
        loadChildren: './problems/problems.module#ProblemsModule'
        }, {
          path: 'users',
          loadChildren: './users/users.module#UsersModule'
        }, {
          path: 'discussions',
          loadChildren: './discussions/discussions.module#DiscussionsModule'
        },{
          path: "search",
          component: GlobalSearchViewComponent
        },
  ]}, {
        path: 'auth',
      component: AuthLayoutComponent,
      children: [{
        path: '',
        loadChildren: './auth/auth.module#AuthModule'
      }]
    },
    {
      path: '**',
      redirectTo: 'dashboard',
    }
];
