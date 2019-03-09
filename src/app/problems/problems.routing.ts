import { Routes } from '@angular/router';

import { WizardComponent } from './form/wizard.component';

export const ProblemsRoutes: Routes = [
  {
      path: '',
      children: [
        {
          path: '',
          component: WizardComponent
        },
        {
          path: 'add',
          component: WizardComponent
        },
        {
          path: ':id/edit',
          component: WizardComponent
        },
    ]
  },
];
