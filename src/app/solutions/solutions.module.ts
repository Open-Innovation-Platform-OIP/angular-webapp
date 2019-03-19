import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NouisliderModule } from "ng2-nouislider";
import { TagInputModule } from "ngx-chips";
import { SelectModule } from "ng2-select";
import { MaterialModule } from "../app.module";
import { SolutionsRoutes } from "./solutions.routing";
import { WizardComponent } from "./form/wizard.component";
import {
  MatChipsModule,
  MAT_CHIPS_DEFAULT_OPTIONS
} from "@angular/material/chips";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { ProblemDetailComponent } from "./detail/problem-detail.component";
import { ProblemsViewComponent } from "./grid/problems-view.component";
import { NguCarouselModule } from "@ngu/carousel";
import { ComponentsModule } from "../components/components.module";
import { DiscussionsModule } from "../discussions/discussions.module";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(SolutionsRoutes),
    FormsModule,
    ReactiveFormsModule,
    NouisliderModule,
    TagInputModule,
    MaterialModule,
    NguCarouselModule,
    ComponentsModule,
    DiscussionsModule
  ],
  declarations: [
    WizardComponent,
    ProblemDetailComponent,
    ProblemsViewComponent
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
export class SolutionsModule {}
