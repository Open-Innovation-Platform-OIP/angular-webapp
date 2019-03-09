import { Routes } from '@angular/router';

import { WizardComponent } from './form/wizard.component';

export const ProblemsRoutes: Routes = [
  {
      path: 'add',
      children: [ {
        path: '',
        component: WizardComponent
      }]
  },
  // {
  //     path: '',
  //     children: [ {
  //       path: 'extended',
  //       component: ExtendedTableComponent
  //     }]
  // },
  // {
  //     path: '',
  //     children: [ {
  //       path: 'datatables.net',
  //       component: DataTableComponent
  //     }]
  // }
];
