import { Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { ViewAllComponent } from './view-all/view-all.component';

export const DashboardRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: DashboardComponent
      },
      {
        path: 'drafts',
        component: ViewAllComponent
      },
      {
        path: 'solutions',
        component: ViewAllComponent
      },
      {
        path: 'problems',
        component: ViewAllComponent
      },
      {
        path: 'contributions',
        component: ViewAllComponent
      },
      {
        path: 'interests',
        component: ViewAllComponent
      },
      {
        path: 'recommended-users',
        component: ViewAllComponent
      }
    ]
  }
];
