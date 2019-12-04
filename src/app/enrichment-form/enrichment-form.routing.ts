import { Routes } from '@angular/router';

import { EnrichmentFormComponent } from './enrichment-form.component';

export const EnrichmentFormRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'add',
        component: EnrichmentFormComponent
      },

      {
        path: ':id/edit',
        component: EnrichmentFormComponent
      }
    ]
  }
];
