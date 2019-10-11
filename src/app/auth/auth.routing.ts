import { Routes } from "@angular/router";

import { RegisterComponent } from "./register/register.component";
import { LockComponent } from "./lock/lock.component";
import { LoginComponent } from "./login/login.component";
import { ForgotPasswordComponent } from "./forgot-password/forgotpassword.component";
import { VerifyEmailComponent } from "./verify-email/verifyemail.component";
import { StagingComponent } from "./staging/staging.component";

export const AuthRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "login",
        component: LoginComponent
      },
      {
        path: "lock",
        component: LockComponent
      },
      {
        path: "register",
        component: RegisterComponent
      },
      {
        path: "forgot",
        component: ForgotPasswordComponent
      },
      {
        path: "verify",
        component: VerifyEmailComponent
      },
      {
        path: "staging",
        component: StagingComponent
      }
    ]
  }
];
