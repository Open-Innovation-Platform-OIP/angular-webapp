import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler
} from "@angular/common/http";
import { Injectable } from "@angular/core";

import { AuthService } from "./auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let authToken = "";
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      // token = currentUser["token"];
      authToken = currentUser["token"];
    }
    console.log(authToken, "type of", typeof authToken);
    const authRequest = req.clone({
      headers: req.headers.set("token", authToken)
    });
    console.log(authRequest, "auth request");
    return next.handle(authRequest);
  }
}
