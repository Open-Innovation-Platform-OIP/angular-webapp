import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { LocalStorage } from '@ngx-pwa/local-storage';
import { JwtHelper } from 'angular2-jwt';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

interface User {
  email: string;
  id: number;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authEndpoint = 'https://hasura1-sa.jaaga.in/auth/';
  private jwtHelper;
  public user: Observable<any>;
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(
    private http: HttpClient,
    // protected localStorage: LocalStorage
  ) {
    this.jwtHelper = new JwtHelper();
    // this.getUser();
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }


  isExpired(jwt) {
    if (jwt) {
      return this.jwtHelper.isTokenExpired(jwt);
    }
    else return true;
  }

  logout() {
    console.log('deleting user token');
    // remove user from local storage to log user out
    // this.localStorage.removeItem('user').subscribe(() => { });
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  login(loginDetails) {
    // console.log(loginDetails);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    return this.http.post(this.authEndpoint + 'login', JSON.stringify(loginDetails), httpOptions)
      .pipe(map(user => {
        if (user && user['token'] && user['id']) {
          user['email'] = loginDetails.email;
          localStorage.setItem('currentUser', JSON.stringify(user));
          // this.storeUser(user);
          this.currentUserSubject.next(<User>user);
        }
        return user;
      }));
  }

  register(user) {
    console.log(user);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    return this.http.post(this.authEndpoint + 'signup', JSON.stringify(user), httpOptions);
  }

  resetPassword(resetDetails) {
    console.log(resetDetails);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    return this.http.post(this.authEndpoint + 'reset', JSON.stringify(resetDetails), httpOptions);
  }
}
