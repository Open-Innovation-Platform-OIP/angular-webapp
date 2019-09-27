import { Routes } from "@angular/router";

// import { DashboardComponent } from "./dashboard.component";
// import { ViewAllComponent } from "../view-all/view-all.component";
import { AdminViewComponent } from "./admin-view.component";

export const AdminViewRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: AdminViewComponent
      }
    ]
  }
];
