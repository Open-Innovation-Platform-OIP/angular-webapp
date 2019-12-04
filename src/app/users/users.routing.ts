import { Routes } from '@angular/router';

import { AddUserProfileComponent } from './form/add-user-profile.component';
import { ProfilesViewComponent } from './grid/profiles-view.component';
import { ViewUserProfileComponent } from './detail/view-user-profile.component';

export const UsersRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ProfilesViewComponent
      },
      {
        path: ':id/edit',
        component: AddUserProfileComponent
      },
      {
        path: ':id',
        component: ViewUserProfileComponent
      },
      {
        path: 'add',
        component: AddUserProfileComponent
      }
    ]
  }
];
