import { Component, OnInit, OnDestroy } from "@angular/core";
import { isEmail } from "validator";
import { AuthService } from "src/app/services/auth.service";
import { Router, ActivatedRoute } from "@angular/router";
import { first } from "rxjs/operators";
import swal from "sweetalert2";
declare var $: any;

@Component({
  selector: "app-register-cmp",
  templateUrl: "./register.component.html"
})
export class RegisterComponent implements OnInit, OnDestroy {
  // test: Date = new Date();
  user = {
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  };
  loading = false;
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    const body = document.getElementsByTagName("body")[0];
    body.classList.add("register-page");
    body.classList.add("off-canvas-sidebar");
  }
  ngOnDestroy() {
    const body = document.getElementsByTagName("body")[0];
    body.classList.remove("register-page");
    body.classList.remove("off-canvas-sidebar");
  }
  canSubmit() {
    if (
      this.user.name &&
      isEmail(this.user.email) &&
      this.user.password.length >= 4 &&
      this.user.password === this.user.confirmPassword
    ) {
      return true;
    }
    return false;
  }
  done(err, res) {
    if (err) console.error(err);
    if (res) {
      console.log(res);
      this.router.navigate([""]);
    }
  }
  register() {
    this.loading = true;
    this.auth.register(this.user).subscribe(
      res => {
        console.log(res);
        this.router.navigateByUrl('/auth/verify');
        // this.auth
        //   .login(this.user)
        //   .pipe(first())
        //   .subscribe(
        //     data => {
        //       swal({
        //         type: "success",
        //         title: "Thank you for signing up!",
        //         timer: 4000,
        //         showConfirmButton: false
        //       }).catch(swal.noop);
        //       this.router.navigate([""]);
        //     },
        //     error => {
        //       console.error(error);
        //       // this.error = error;
        //       this.loading = false;
        //     }
        //   );
      },
      err => {
        console.error(err);
        alert(err.message);
      }
    );
  }
}
