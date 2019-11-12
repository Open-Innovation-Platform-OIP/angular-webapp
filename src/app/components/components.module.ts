import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdModule } from '../md/md.module';
import { MaterialModule } from '../app.module';
import { RouterModule } from '@angular/router';

import {
  MatChipsModule,
  MAT_CHIPS_DEFAULT_OPTIONS
} from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { AddEnrichmentComponent } from './add-enrichment/add-enrichment.component';
import { ViewEnrichmentComponent } from './view-enrichment/view-enrichment.component';
import { ViewCollaboratorsComponent } from './view-collaborators/view-collaborators.component';
import { AddValidationComponent } from './add-validation/add-validation.component';
import { ValidateCardComponent } from './validate-card/validate-card.component';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import { EnrichmentCardComponent } from './enrichment-card/enrichment-card.component';
import { DetailedValidateViewComponent } from './detailed-validate-view/detailed-validate-view.component';
import { AddCollaboratorComponent } from './add-collaborator/add-collaborator.component';
import { CollaboratorCardComponent } from './collaborator-card/collaborator-card.component';
import { ProblemCardComponent } from './problem-card/problem-card.component';
import { DisplayModalComponent } from './display-modal/display-modal.component';
import { WizardContainerComponent } from './wizard-container/wizard-container.component';
// import { GlobalSearchCardsComponent } from "./global-search-cards/global-search-cards.component";
import { ShareAutofocusModule } from '../share-autofocus/share-autofocus.module';
import { SolutionCardComponent } from './solution-card/solution-card.component';
import { FilterDropdownComponent } from './filter-dropdown/filter-dropdown.component';
import { ModalComponent } from './modal/modal.component';
import { DomainAddModalComponent } from './domain-add-modal/domain-add-modal.component';

@NgModule({
  entryComponents: [ModalComponent, DomainAddModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    MdModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    ShareAutofocusModule
  ],
  declarations: [
    AddEnrichmentComponent,
    ViewEnrichmentComponent,
    ViewCollaboratorsComponent,
    AddValidationComponent,
    AddEnrichmentComponent,
    ViewEnrichmentComponent,
    ViewCollaboratorsComponent,

    ValidateCardComponent,
    ProfileCardComponent,
    EnrichmentCardComponent,
    DetailedValidateViewComponent,
    AddCollaboratorComponent,
    CollaboratorCardComponent,
    ProblemCardComponent,
    DisplayModalComponent,
    WizardContainerComponent,
    SolutionCardComponent,
    FilterDropdownComponent,
    ModalComponent,
    DomainAddModalComponent
  ],
  exports: [
    AddEnrichmentComponent,
    ViewEnrichmentComponent,
    ViewCollaboratorsComponent,

    AddEnrichmentComponent,
    ViewEnrichmentComponent,
    ViewCollaboratorsComponent,
    AddValidationComponent,
    ValidateCardComponent,
    ProfileCardComponent,
    EnrichmentCardComponent,
    DetailedValidateViewComponent,
    AddCollaboratorComponent,
    CollaboratorCardComponent,
    ProblemCardComponent,
    SolutionCardComponent,
    DisplayModalComponent,
    WizardContainerComponent,
    FilterDropdownComponent,
    ModalComponent,
    DomainAddModalComponent
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
export class ComponentsModule {}
