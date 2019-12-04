import { Routes } from '@angular/router';
import { AdminViewComponent } from './admin-view.component';
import { DomainsComponent } from './domains/domains.component';
import { InviteUserComponent } from './invite-user/invite-user.component';
import { DomainAddGuard } from '../services/domain-add.guard';

export const AdminViewRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AdminViewComponent
      },
      {
        path: 'domains',
        component: DomainsComponent,
        canActivate: [DomainAddGuard]
      },
      {
        path: 'invite-user',
        component: InviteUserComponent
      }
    ]
  }
];
