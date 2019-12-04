import { Routes } from '@angular/router';

import { LandingPageComponent } from './landing-page.component';

export const LandingPageRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: LandingPageComponent
      }
    ]
  }
];
