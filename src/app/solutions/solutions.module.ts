import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NouisliderModule } from "ng2-nouislider";
import { TagInputModule } from "ngx-chips";
import { SelectModule } from "ng2-select";
import { MaterialModule } from "../app.module";
import { SolutionsRoutes } from "./solutions.routing";
import {
  MatChipsModule,
  MAT_CHIPS_DEFAULT_OPTIONS
} from "@angular/material/chips";
import { COMMA, ENTER } from "@angular/cdk/keycodes";

import { NguCarouselModule } from "@ngu/carousel";
import { ComponentsModule } from "../components/components.module";
import { DiscussionsModule } from "../discussions/discussions.module";
import { SolutionDetailComponent } from "./detail/solution-detail.component";
import { SolutionsViewComponent } from "./grid/solutions-view.component";
import { AddSolutionComponent } from "./form/add-solution.component";

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
    SolutionDetailComponent,
    SolutionsViewComponent,
    AddSolutionComponent
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
