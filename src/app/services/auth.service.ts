import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
// import { LocalStorage } from '@ngx-pwa/local-storage';
import { JwtHelper } from "angular2-jwt";
import { Observable, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { Apollo } from "apollo-angular";
import { Router } from "@angular/router";

interface User {
  email: string;
  id: number;
  token: string;
}

interface resetDetails {
  email: string;
  password: string;
  confirmPassword: string;
  otp: string;
}

interface verificationDetails {
  email: string;
  otp: string;
}

@Injectable({
  providedIn: "root"
})
export class AuthService {
  authEndpoint = "https://auth-new.socialalpha.jaagalabs.com/auth/";
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
    // this.getUser();
    this.currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem("currentUser"))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    if (this.currentUserSubject.value) {
      return this.currentUserSubject.value;
      // }
    } else {
      return { id: 0, email: "", token: "" };
    }
  }

  isExpired(jwt) {
    if (jwt) {
      return this.jwtHelper.isTokenExpired(jwt);
    } else return true;
  }

  logout() {
    console.log("deleting user token");
    // remove user from local storage to log user out
    // this.localStorage.removeItem('user').subscribe(() => { });
    localStorage.removeItem("currentUser");
    this.currentUserSubject.next(null);
    this.apollo.getClient().resetStore();
    // this.router.navigateByUrl("/landing-page");
    window.location.href = `/landing-page`;

    // location.replace('https://app.socialalpha.jaagalabs.com')
    // location.reload();
  }

  login(loginDetails) {
    // console.log(loginDetails);
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    };
    return this.http
      .post(
        this.authEndpoint + "login",
        JSON.stringify(loginDetails),
        httpOptions
      )
      .pipe(
        map(user => {
          if (user && user["token"] && user["id"]) {
            user["email"] = loginDetails.email;
            // localStorage.setItem('currentUser', JSON.stringify(user));
            return this.storeUser(user);
            // this.currentUserSubject.next(<User>user);
          }
          return user;
        })
      );
  }

  storeUser(user) {
    if (
      user &&
      user["token"] &&
      user["id"] &&
      user["email"] &&
      !this.isExpired(user["token"])
    ) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      // this.currentUserSubject.next(<User>user);
      this.currentUserSubject = new BehaviorSubject<any>(
        JSON.parse(localStorage.getItem("currentUser"))
      );
      this.currentUser = this.currentUserSubject.asObservable();
      return user;
    }
    return false;
  }

  register(user) {
    // console.log(user);
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    };
    return this.http.post(
      this.authEndpoint + "signup",
      JSON.stringify(user),
      httpOptions
    );
  }

  requestVerificationEmail(email: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    };
    const payload = {
      email: email
    };
    return this.http.post(
      this.authEndpoint + "verification",
      JSON.stringify(payload),
      httpOptions
    );
  }

  completeVerification(payload: verificationDetails) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    };
    return this.http.post(
      this.authEndpoint + "verify",
      JSON.stringify(payload),
      httpOptions
    );
  }

  requestResetCode(email: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    };
    const payload = {
      email: email
    };
    return this.http.post(
      this.authEndpoint + "passwordreset",
      JSON.stringify(payload),
      httpOptions
    );
  }

  resetPassword(payload: resetDetails) {
    // console.log(resetDetails);
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    };
    return this.http.post(
      this.authEndpoint + "changepassword",
      JSON.stringify(payload),
      httpOptions
    );
  }
}
