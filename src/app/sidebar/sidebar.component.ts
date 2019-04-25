import { Component, OnInit, ElementRef } from "@angular/core";
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
    path: "/dashboard",
    title: "Dashboard",
    type: "link",
    icontype: "dashboard"
  },
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
  private toggleButton: any;
  private sidebarVisible: boolean;
  mobile_menu_visible: any = 0;

  constructor(
    public auth: AuthService,
    private router: Router,
    private element: ElementRef,
    private usersService: UsersService
  ) {
    this.sidebarVisible = false;
  }

  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName("navbar-toggler")[0];
  }

  updatePS(): void {
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemSidebar = <HTMLElement>(
        document.querySelector(".sidebar .sidebar-wrapper")
      );
      if (elemSidebar) {
        const ps = new PerfectScrollbar(elemSidebar, {
          wheelSpeed: 2,
          suppressScrollX: true
        });
      }
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

  sidebarClose() {
    var $toggle = document.getElementsByClassName("navbar-toggler")[0];
    const body = document.getElementsByTagName("body")[0];
    // this.toggleButton.classList.remove("toggled");
    var $layer = document.createElement("div");
    $layer.setAttribute("class", "close-layer");

    this.sidebarVisible = false;
    body.classList.remove("nav-open");
    // $('html').removeClass('nav-open');
    body.classList.remove("nav-open");
    if ($layer) {
      $layer.remove();
    }

    setTimeout(function() {
      $toggle.classList.remove("toggled");
    }, 400);

    this.mobile_menu_visible = 0;
  }
}
