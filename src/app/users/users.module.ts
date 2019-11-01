import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { TagInputModule } from 'ngx-chips';
import { SelectModule } from 'ng2-select';
import { MaterialModule } from '../app.module';
import {
  MatChipsModule,
  MAT_CHIPS_DEFAULT_OPTIONS
} from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { UsersRoutes } from './users.routing';
import { AddUserProfileComponent } from './form/add-user-profile.component';
import { ProfilesViewComponent } from './grid/profiles-view.component';
import { ViewUserProfileComponent } from './detail/view-user-profile.component';
import { NguCarouselModule } from '@ngu/carousel';
import { ComponentsModule } from '../components/components.module';
import { A11yModule } from '@angular/cdk/a11y';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(UsersRoutes),
    FormsModule,
    ReactiveFormsModule,
    NouisliderModule,
    TagInputModule,
    MaterialModule,
    NguCarouselModule,
    ComponentsModule,
    A11yModule
  ],
  declarations: [
    AddUserProfileComponent,
    ProfilesViewComponent,
    ViewUserProfileComponent
  ],
  providers: [
    {
      provide: MAT_CHIPS_DEFAULT_OPTIONS,
      useValue: {
        separatorKeyCodes: [ENTER, COMMA]
      }
    }
  ]
})
export class UsersModule {}
