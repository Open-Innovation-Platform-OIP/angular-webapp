import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { isEmail } from 'validator';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
declare var $: any;

@Component({
  selector: 'app-forgotpassword-cmp',
  templateUrl: './forgotpassword.component.html'
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  step = 0;
  resetDetails = {
    email: '',
    otp: '',
    password: '',
    confirmPassword: ''
  };
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
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
    let navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('login-page');
    body.classList.add('off-canvas-sidebar');
    const card = document.getElementsByClassName('card')[0];

    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/';
      this.resetDetails.email = params['email'] || '';
      this.step = Number(params['step']);
      if (this.step === 1) {
        $('#otpfield').focus();
      } else {
        this.step = 0;
      }
      // console.log(this.step);
    });
  }
  sidebarToggle() {
    let toggleButton = this.toggleButton;
    let body = document.getElementsByTagName('body')[0];
    let sidebar = document.getElementsByClassName('navbar-collapse')[0];
    if (this.sidebarVisible == false) {
      setTimeout(function() {
        toggleButton.classList.add('toggled');
      }, 500);
      body.classList.add('nav-open');
      this.sidebarVisible = true;
    } else {
      this.toggleButton.classList.remove('toggled');
      this.sidebarVisible = false;
      body.classList.remove('nav-open');
    }
  }
  ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('login-page');
    body.classList.remove('off-canvas-sidebar');
  }
  canSubmit() {
    if (
      isEmail(this.resetDetails.email) &&
      this.resetDetails.otp.length >= 4 &&
      this.resetDetails.password.length >= 4 &&
      this.resetDetails.password === this.resetDetails.confirmPassword
    ) {
      return true;
    }
    return false;
  }
  done(err, res) {
    if (err) { console.error(err); }
    if (res) { console.log(res); }
  }
  requestOTP() {
    this.loading = true;
    this.auth
      .requestResetCode(this.resetDetails.email)
      .pipe(first())
      .subscribe(
        data => {
          this.loading = false;
          this.step = 1;
        },
        error => {
          console.error('OTP Error: ', error);
          this.error = error;
          alert('Something went wrong, please try again.');
          this.loading = false;
        }
      );
  }
  submit() {
    this.submitted = true;
    this.loading = true;

    this.auth
      .resetPassword(this.resetDetails)
      .pipe(first())
      .subscribe(
        data => {
          alert(
            'Your password has been updated. You can now login with the new password.'
          );
          this.router.navigate(['/login']);
        },
        error => {
          this.error = error;
          this.loading = false;
        }
      );
  }
}
