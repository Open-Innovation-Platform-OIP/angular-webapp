import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { TagInputModule } from 'ngx-chips';
import { SelectModule } from 'ng2-select';
import { MaterialModule } from '../app.module';
import { ProblemsRoutes } from './problems.routing';
import { WizardComponent } from './form/wizard.component';
import { MatChipsModule, MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ProblemsRoutes),
    FormsModule,
    ReactiveFormsModule,
    NouisliderModule,
    TagInputModule,
    MaterialModule,
  ],
  declarations: [
    WizardComponent,
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

export class ProblemsModule { }

