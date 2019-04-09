import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { isEmail } from "validator";
import { AuthService } from "src/app/services/auth.service";
import { Router, ActivatedRoute } from "@angular/router";
import { first } from "rxjs/operators";
declare var $: any;

@Component({
  selector: "app-login-cmp",
  templateUrl: "./login.component.html"
})
export class LoginComponent implements OnInit, OnDestroy {
  loginDetails = {
    email: "",
    password: ""
  };
  loading = true;
  submitted = false;
  returnUrl: string = "/";
  error = "";
  private toggleButton: any;
  private sidebarVisible: boolean;
  private nativeElement: Node;

  constructor(
    private element: ElementRef,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.nativeElement = element.nativeElement;
    this.sidebarVisible = false;
  }

  ngOnInit() {
    var navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName("navbar-toggle")[0];
    const body = document.getElementsByTagName("body")[0];
    body.classList.add("login-page");
    body.classList.add("off-canvas-sidebar");
    const card = document.getElementsByClassName("card")[0];
    setTimeout(function() {
      // after 1000 ms we add the class animated to the login/register card
      card.classList.remove("card-hidden");
    }, 700);
    this.route.queryParams.subscribe(params => {
      // console.log(params);
      const err = params["err"];
      if (err) {
        console.log(err);
        alert(err);
        return false;
      }
      const user = {
        id: params["id"],
        email: params["email"],
        token: params["token"]
      };
      this.returnUrl = params["returnUrl"] || "/";
      // console.log(user, this.returnUrl);
      if (user && user["token"] && user["id"] && user["email"]) {
        const res = this.auth.storeUser(user);
        if (res) {
          // this.
          console.log("valid token for", this.auth.currentUserValue.email);
          this.router.navigate([this.returnUrl]);
        } else {
          // console.log('invalid token');
          alert("Invalid login. Please try again");
        }
      }
    });
    this.loading = false;
    // this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";
  }
  sidebarToggle() {
    var toggleButton = this.toggleButton;
    var body = document.getElementsByTagName("body")[0];
    var sidebar = document.getElementsByClassName("navbar-collapse")[0];
    if (this.sidebarVisible == false) {
      setTimeout(function() {
        toggleButton.classList.add("toggled");
      }, 500);
      body.classList.add("nav-open");
      this.sidebarVisible = true;
    } else {
      this.toggleButton.classList.remove("toggled");
      this.sidebarVisible = false;
      body.classList.remove("nav-open");
    }
  }
  ngOnDestroy() {
    const body = document.getElementsByTagName("body")[0];
    body.classList.remove("login-page");
    body.classList.remove("off-canvas-sidebar");
  }

  onTyping(event) {
    // console.log(this.loginDetails);
  }

  canSubmit() {
    if (isEmail(this.loginDetails.email) && this.loginDetails.password) {
      // console.log('ok');
      return true;
    }
    return false;
  }
  done(err, res) {
    if (err) console.error(err);
    if (res) console.log(res);
  }
  login() {
    if (!(isEmail(this.loginDetails.email) && this.loginDetails.password)) {
      return alert("Please enter a valid email and password");
    }
    this.submitted = true;
    this.loading = true;
    // this.auth.login(this.loginDetails, this.done);
    this.auth
      .login(this.loginDetails)
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigate([this.returnUrl]);
          this.showNotification("bottom", "left");
        },
        error => {
          console.error(error);
          this.error = error;
          const msg = error.error.msg;
          if (
            typeof msg === "string" &&
            msg.toLowerCase().search("already verified") !== -1
          ) {
            alert(
              "Your email is already verified. You can login or request a password reset"
            );
          } else if (
            typeof msg === "string" &&
            msg.toLowerCase().search("not been verified") !== -1
          ) {
            alert(
              "Your email has not been verified. Click OK to proceed to the email verification page."
            );
            this.router.navigateByUrl(
              `/auth/verify?email=${this.loginDetails.email}`
            );
          } else if (
            typeof msg === "string" &&
            msg.toLowerCase().search("unknown") !== -1
          ) {
            alert("Unknown email address. Perhaps you have not signed up yet?");
          } else {
            alert(msg);
          }
          this.loading = false;
          // alert(error.error.errors[0].msg);
        }
      );
  }
  forgotPassword() {
    // send reset request to server
    // console.log("sending reset email to your inbox");
    // this.router.navigate(["/auth/forgot",]);
    console.log(this.loginDetails);
    this.router.navigateByUrl(`/auth/forgot?email=${this.loginDetails.email}`);
  }

  showNotification(from: any, align: any) {
    const type = [
      "",
      "info",
      "success",
      "warning",
      "danger",
      "rose",
      "primary"
    ];

    const color = Math.floor(Math.random() * 6 + 1);

    $.notify(
      {
        icon: "notifications",
        message:
          "Update your profile information to make the most out of the platform."
      },
      {
        type: type[color],
        timer: 10000,
        placement: {
          from: from,
          align: align
        },
        template:
          '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
          '<button mat-raised-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
          '<i class="material-icons" data-notify="icon">notifications</i> ' +
          '<span data-notify="title">{1}</span> ' +
          '<span data-notify="message">{2}</span>' +
          '<div class="progress" data-notify="progressbar">' +
          '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
          "</div>" +
          '<a href="{3}" target="{4}" data-notify="url"></a>' +
          "</div>"
      }
    );
  }
}
