import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdModule } from '../md/md.module';
import { MaterialModule } from '../app.module';
import { ComponentsModule } from '../components/components.module';
import { AdminViewComponent } from './admin-view.component';

import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { AdminViewRoutes } from './admin-view.routing';
import { DomainsComponent } from './domains/domains.component';
import { InviteUserComponent } from './invite-user/invite-user.component';
import {
  MatChipsModule,
  MAT_CHIPS_DEFAULT_OPTIONS
} from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminViewRoutes),
    FormsModule,
    MdModule,
    MaterialModule,
    ComponentsModule,
    NgxUiLoaderModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: MAT_CHIPS_DEFAULT_OPTIONS,
      useValue: {
        separatorKeyCodes: [ENTER, COMMA]
      }
    }
  ],

  declarations: [AdminViewComponent, DomainsComponent, InviteUserComponent],
  exports: [AdminViewComponent]
})
export class AdminViewModule {}
