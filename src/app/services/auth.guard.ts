import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanActivateChild
} from "@angular/router";
import { Observable } from "rxjs";
import { tap, map, take } from "rxjs/operators";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root"
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(public auth: AuthService, private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const currentUser = this.auth.currentUserValue;
    // console.log(currentUser.id, "id in auth");

    if (currentUser && !this.auth.isExpired(currentUser.token)) {
      return true;
    }

    // not logged in so redirect to login page with the return url
    // this.router.navigate(["/auth/login"], {
    //   queryParams: { returnUrl: state.url }
    // });
    this.router.navigate(["/landing-page"], {
      queryParamsHandling: "preserve"
    });
    // this.router.navigate(['/auth/login']);
    return false;
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(next, state);
  }
}
