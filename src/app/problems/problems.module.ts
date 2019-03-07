import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { ProblemsRoutes } from './problems.routing';
import { WizardComponent } from './form/wizard.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ProblemsRoutes),
    FormsModule,
    MaterialModule
  ],
  declarations: [
    WizardComponent,
  ]
})

export class ProblemsModule {}
