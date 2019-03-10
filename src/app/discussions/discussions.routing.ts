import { Routes } from '@angular/router';

import { DiscussionsComponent } from './discussions.component';

export const DiscussionsRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: DiscussionsComponent
    }]
}
];
