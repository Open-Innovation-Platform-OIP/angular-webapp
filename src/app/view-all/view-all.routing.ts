import { Routes } from '@angular/router';

import { ViewAllComponent } from './view-all.component';

export const ViewAllRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ViewAllComponent
      }
    ]
  }
];
