import { Component, OnInit } from "@angular/core";
import PerfectScrollbar from "perfect-scrollbar";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { UsersService } from "../services/users.service";
import { GeocoderService } from "../services/geocoder.service";

declare const $: any;

//Metadata
export interface RouteInfo {
  path: string;
  title: string;
  type: string;
  icontype: string;
  collapse?: string;
  children?: ChildrenItems[];
}

export interface ChildrenItems {
  path: string;
  title: string;
  ab: string;
  type?: string;
}

//Menu Items
export const ROUTES: RouteInfo[] = [
  {
    path: "/problems",
    title: "Problems",
    type: "link",
    icontype: "help"
  },
  {
    path: "/abc",
    title: "Solutions",
    type: "link",
    icontype: "highlight"
  }
];
@Component({
  selector: "app-sidebar-cmp",
  templateUrl: "sidebar.component.html"
})
export class SidebarComponent implements OnInit {
  public menuItems: any[];

  constructor(
    public auth: AuthService,
    private router: Router,
    private usersService: UsersService
  ) {
    if (this.auth.currentUserValue.id) {
      ROUTES.unshift({
        path: "/dashboard",
        title: "Dashboard",
        type: "link",
        icontype: "dashboard"
      });
    } else {
      ROUTES.unshift({
        path: "/landing-page",
        title: "Landing Page",
        type: "link",
        icontype: "dashboard"
      });
    }
  }

  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  updatePS(): void {
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemSidebar = <HTMLElement>(
        document.querySelector(".sidebar .sidebar-wrapper")
      );
      const ps = new PerfectScrollbar(elemSidebar, {
        wheelSpeed: 2,
        suppressScrollX: true
      });
    }
  }
  isMac(): boolean {
    let bool = false;
    if (
      navigator.platform.toUpperCase().indexOf("MAC") >= 0 ||
      navigator.platform.toUpperCase().indexOf("IPAD") >= 0
    ) {
      bool = true;
    }
    return bool;
  }
  // logout() {
  //   this.auth.logout();
  //   this.router.navigate(["/auth/login"]);
  // }
}
