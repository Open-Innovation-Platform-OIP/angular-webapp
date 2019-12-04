import { Routes } from '@angular/router';

import { SolutionDetailComponent } from './detail/solution-detail.component';
import { AddSolutionComponent } from './form/add-solution.component';
import { SolutionsViewComponent } from './grid/solutions-view.component';

export const SolutionsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: SolutionsViewComponent
      },
      {
        path: 'add',
        component: AddSolutionComponent
      },
      {
        path: ':id',
        component: SolutionDetailComponent
      },
      {
        path: ':id/edit',
        component: AddSolutionComponent
      }
    ]
  }
];
