import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MdModule } from "../md/md.module";
import { MaterialModule } from "../app.module";
import { ComponentsModule } from "../components/components.module";
import { DashboardComponent } from "./dashboard.component";
import { DashboardRoutes } from "./dashboard.routing";
import { ViewAllComponent } from "../view-all/view-all.component";
import { NgxUiLoaderModule } from "ngx-ui-loader";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(DashboardRoutes),
    FormsModule,
    MdModule,
    MaterialModule,
    ComponentsModule,
    NgxUiLoaderModule
  ],
  declarations: [DashboardComponent, ViewAllComponent]
})
export class DashboardModule {}
