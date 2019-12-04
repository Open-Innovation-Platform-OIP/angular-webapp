import { Routes } from '@angular/router';

import { GlobalSearchViewComponent } from './global-search-view.component';

export const GlobalSearchViewRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: GlobalSearchViewComponent
      }
    ]
  }
];
