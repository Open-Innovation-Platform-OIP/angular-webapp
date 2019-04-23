import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ViewAllComponent } from "./view-all.component";
import { ComponentsModule } from "./../components/components.module";
import { FormsModule } from "@angular/forms";
import { ViewAllRoutes } from "./view-all.routing";
import { ShareAutofocusModule } from "../share-autofocus/share-autofocus.module";

@NgModule({
  imports: [
    RouterModule.forChild(ViewAllRoutes),
    CommonModule,
    FormsModule,
    ComponentsModule,
    ShareAutofocusModule
  ],
  declarations: [ViewAllComponent],
  exports: [ViewAllComponent]
})
export class ViewAllModule {}
