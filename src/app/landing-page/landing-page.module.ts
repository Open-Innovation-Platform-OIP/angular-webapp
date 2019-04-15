import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { LandingPageComponent } from "./landing-page.component";
import { ComponentsModule } from "../components/components.module";
import { FormsModule } from "@angular/forms";
import { LandingPageRoutes } from "./landing-page.routing";
import { ShareAutofocusModule } from "../share-autofocus/share-autofocus.module";

@NgModule({
  imports: [
    RouterModule.forChild(LandingPageRoutes),
    CommonModule,
    FormsModule,
    ComponentsModule,
    ShareAutofocusModule
  ],
  declarations: [LandingPageComponent],
  exports: [LandingPageComponent]
})
export class LandingPageModule {}
