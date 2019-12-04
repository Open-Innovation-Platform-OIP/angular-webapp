import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { FilterService } from './filter.service';

@Injectable({
  providedIn: 'root'
})
export class DomainAddGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private filterService: FilterService
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const isAdmin = false;
    const parser = document.createElement('a');
    parser.href = window.location.href;
    if (this.filterService.isPrimaryDomain) {
      return true;
    } else {
      this.router.navigate(['/dashboard']);

      return false;
    }
  }
}
