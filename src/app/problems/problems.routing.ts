import { Routes } from '@angular/router';

import { WizardComponent } from './form/wizard.component';
import { ProblemDetailComponent } from './detail/problem-detail.component';
import { ProblemsViewComponent } from './grid/problems-view.component';

export const ProblemsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ProblemsViewComponent
      },
      {
        path: 'add',
        component: WizardComponent
      },
      {
        path: ':id',
        component: ProblemDetailComponent
      },
      {
        path: ':id/edit',
        component: WizardComponent
      }
    ]
  }
];
