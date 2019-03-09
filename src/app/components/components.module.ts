import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MdModule } from '../md/md.module';
import { MaterialModule } from '../app.module';
import { RouterModule } from '@angular/router';

import { AddEnrichmentComponent } from "./add-enrichment/add-enrichment.component";
import { ViewEnrichmentComponent } from "./view-enrichment/view-enrichment.component";
import { ViewCollaboratorsComponent } from "./view-collaborators/view-collaborators.component";
import { ValidateProblemComponent } from "./validate-problem/validate-problem.component";
import { ValidateCardComponent } from "./validate-card/validate-card.component";
import { ProfileCardComponent } from "./profile-card/profile-card.component";
import { EnrichmentCardComponent } from "./enrichment-card/enrichment-card.component";
import { DetailedValidateViewComponent } from "./detailed-validate-view/detailed-validate-view.component";
import { AddCollaboratorComponent } from "./add-collaborator/add-collaborator.component";
import { CollaboratorCardComponent } from "./collaborator-card/collaborator-card.component";
import { ProblemCardComponent } from "./problem-card/problem-card.component";
// import { GlobalSearchCardsComponent } from "./global-search-cards/global-search-cards.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MdModule,
        MaterialModule,
        RouterModule
    ],
    declarations: [
        AddEnrichmentComponent,
        ViewEnrichmentComponent,
        ViewCollaboratorsComponent,
        ValidateProblemComponent,
        AddEnrichmentComponent,
        ViewEnrichmentComponent,
        ViewCollaboratorsComponent,
        ValidateProblemComponent,
        ValidateCardComponent,
        ProfileCardComponent,
        EnrichmentCardComponent,
        DetailedValidateViewComponent,
        AddCollaboratorComponent,
        CollaboratorCardComponent,
        ProblemCardComponent
    ],
    exports: [
        AddEnrichmentComponent,
        ViewEnrichmentComponent,
        ViewCollaboratorsComponent,
        ValidateProblemComponent,
        AddEnrichmentComponent,
        ViewEnrichmentComponent,
        ViewCollaboratorsComponent,
        ValidateProblemComponent,
        ValidateCardComponent,
        ProfileCardComponent,
        EnrichmentCardComponent,
        DetailedValidateViewComponent,
        AddCollaboratorComponent,
        CollaboratorCardComponent,
        ProblemCardComponent
    ]
})

export class ComponentsModule { }
