import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MdModule } from "../md/md.module";
import { MaterialModule } from "../app.module";
import { ComponentsModule } from "../components/components.module";
import { AdminViewComponent } from "./admin-view.component";

import { NgxUiLoaderModule } from "ngx-ui-loader";
import { AdminViewRoutes } from "./admin-view.routing";

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

  declarations: [AdminViewComponent],
  exports: [AdminViewComponent]
})
export class AdminViewModule {}
