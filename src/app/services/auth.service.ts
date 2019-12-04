import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { JwtHelper } from 'angular2-jwt';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';

interface User {
  email: string;
  id: number;
  token: string;
  is_admin: Boolean;
}

interface ResetDetails {
  email: string;
  password: string;
  confirmPassword: string;
  otp: string;
}

interface VerificationDetails {
  email: string;
  otp: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authEndpoint = 'https://sa-auth-dev.dev.jaagalabs.com/auth/';

  private jwtHelper;
  public user: Observable<any>;
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(
    private http: HttpClient,
    private apollo: Apollo,
    private router: Router // protected localStorage: LocalStorage
  ) {
    this.jwtHelper = new JwtHelper();

    this.currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('currentUser'))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    if (this.currentUserSubject.value) {
      return this.currentUserSubject.value;
      // }
    } else {
      return { id: 0, email: '', token: '', is_admin: false };
    }
  }

  isExpired(jwt) {
    if (jwt) {
      return this.jwtHelper.isTokenExpired(jwt);
    } else {
      return true;
    }
  }

  logout() {
    // remove user from local storage to log user out

    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.apollo.getClient().resetStore();

    window.location.href = `/landing-page`;
  }

  login(loginDetails) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .post(
        this.authEndpoint + 'login',
        JSON.stringify(loginDetails),
        httpOptions
      )
      .pipe(
        map(user => {
          if (user && user['token'] && user['id']) {
            user['email'] = loginDetails.email;

            return this.storeUser(user);
          }
          return user;
        })
      );
  }

  storeUser(user) {
    if (
      user &&
      user['token'] &&
      user['id'] &&
      user['email'] &&
      !this.isExpired(user['token'])
    ) {
      localStorage.setItem('currentUser', JSON.stringify(user));

      this.currentUserSubject = new BehaviorSubject<any>(
        JSON.parse(localStorage.getItem('currentUser'))
      );
      this.currentUser = this.currentUserSubject.asObservable();
      return user;
    }
    return false;
  }

  register(user) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(
      this.authEndpoint + 'signup',
      JSON.stringify(user),
      httpOptions
    );
  }

  requestVerificationEmail(email: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const payload = {
      email: email
    };
    return this.http.post(
      this.authEndpoint + 'verification',
      JSON.stringify(payload),
      httpOptions
    );
  }

  completeVerification(payload: VerificationDetails) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(
      this.authEndpoint + 'verify',
      JSON.stringify(payload),
      httpOptions
    );
  }

  requestResetCode(email: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const payload = {
      email: email
    };
    return this.http.post(
      this.authEndpoint + 'passwordreset',
      JSON.stringify(payload),
      httpOptions
    );
  }

  resetPassword(payload: ResetDetails) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(
      this.authEndpoint + 'changepassword',
      JSON.stringify(payload),
      httpOptions
    );
  }
}
