import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FocusMonitor, LiveAnnouncer } from '@angular/cdk/a11y';
import { isEmail } from 'validator';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { link } from 'fs';
import { UsersService } from '../../services/users.service';

declare var $: any;

@Component({
  selector: 'app-login-cmp',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginDetails = {
    email: '',
    password: ''
  };
  loading = true;
  submitted = false;
  returnUrl = '/';
  error = '';
  link = '';
  private toggleButton: any;
  private sidebarVisible: boolean;
  private nativeElement: Node;

  constructor(
    private element: ElementRef,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UsersService,
    private currentTitle: Title,
    private focusMonitor: FocusMonitor,
    private liveAnnouncer: LiveAnnouncer
  ) {
    this.nativeElement = element.nativeElement;
    this.sidebarVisible = false;
    setTimeout(() => {}, 1000);
  }

  ngOnInit() {
    const pageHeading = this.element.nativeElement.querySelector('#heading');
    setTimeout(() => {
      this.focusMonitor.focusVia(pageHeading, 'program');
    }, 1000);
    this.currentTitle.setTitle('Login');

    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('login-page');
    body.classList.add('off-canvas-sidebar');
    const card = document.getElementsByClassName('card')[0];
    setTimeout(function() {
      card.classList.remove('card-hidden');
    }, 700);
    this.route.queryParams.subscribe(params => {
      const err = params['err'];
      if (err) {
        console.error(err);
        alert(err);
        return false;
      }
      const user = {
        id: params['id'],
        email: params['email'],
        token: params['token'],
        role: params['role']
      };
      if (user.role == 'admin') {
        user['is_admin'] = true;
      } else {
        user['is_admin'] = false;
      }
      this.returnUrl = params['returnUrl'] || '/';

      if (user && user['token'] && user['id'] && user['email']) {
        const res = this.auth.storeUser(user);
        if (res) {
          window.location.href = `${this.returnUrl}`;
        } else {
          alert('Invalid login. Please try again');
        }
      }
    });
    this.loading = false;
  }
  sidebarToggle() {
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName('body')[0];
    const sidebar = document.getElementsByClassName('navbar-collapse')[0];
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

  onTyping(event) {}

  canSubmit() {
    if (isEmail(this.loginDetails.email) && this.loginDetails.password) {
      return true;
    }
    return false;
  }
  done(err, res) {
    if (err) { console.error(err); }
    if (res) { console.log(res); }
  }
  login() {
    if (!(isEmail(this.loginDetails.email) && this.loginDetails.password)) {
      return alert('Please enter a valid email and password');
    }
    this.submitted = true;
    this.loading = true;

    this.auth
      .login(this.loginDetails)
      .pipe(first())
      .subscribe(
        data => {
          window.location.href = `${this.returnUrl}`;

          this.userService.getCurrentUser();

          const message =
            'Update your profile information to make the most out of the platform.';

          setTimeout(() => {
            this.showNotification([
              'bottom',
              'left',
              '',
              'notifications',
              3000,
              message
            ]);
          }, 1000);
        },
        error => {
          console.error(error);
          this.error = error;
          const msg = error.error.msg;
          if (
            typeof msg === 'string' &&
            msg.toLowerCase().search('already verified') !== -1
          ) {
            const message =
              'Your email is already verified. You can login or request a password reset';
            this.showNotification([
              'top',
              'center',
              4,
              'warning',
              3000,
              message
            ]);
          } else if (
            typeof msg === 'string' &&
            msg.toLowerCase().search('not been verified') !== -1
          ) {
            const message =
              'Your email has not been verified. Click OK to proceed to the email verification page.';
            this.showNotification([
              'top',
              'center',
              4,
              'warning',
              3000,
              message
            ]);
            this.router.navigateByUrl(
              `/auth/verify?email=${this.loginDetails.email}`
            );
          } else if (
            typeof msg === 'string' &&
            msg.toLowerCase().search('unknown') !== -1
          ) {
            const message =
              'Unknown email address. Perhaps you have not signed up yet?';
            this.showNotification([
              'top',
              'center',
              4,
              'warning',
              3000,
              message
            ]);
          } else if (msg instanceof Object && !Object.entries(msg).length) {
            this.login();
          } else {
            this.showNotification(['top', 'center', 4, 'warning', 3000, msg]);
          }
          this.loading = false;
        }
      );
  }
  forgotPassword() {
    // send reset request to server
    this.router.navigateByUrl(`/auth/forgot?email=${this.loginDetails.email}`);
  }

  showNotification(values) {
    let [from, align, color, icon, time, message] = [...values];
    const type = [
      '',
      'info',
      'success',
      'warning',
      'danger',
      'rose',
      'primary'
    ];

    if (!color) {
      color = Math.floor(Math.random() * 6 + 1);
    }

    $.notify(
      {
        icon: icon,
        message: message
      },
      {
        type: type[color],
        timer: time,
        placement: {
          from: from,
          align: align
        },
        template:
          '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
          '<button mat-raised-button type="button" aria-hidden="true" class="close" data-notify="dismiss"> ' +
          '<i class="material-icons">close</i></button>' +
          `<i class="material-icons" data-notify="icon">${icon}</i>` +
          '<span data-notify="title">{1}</span> ' +
          '<span data-notify="message">{2}</span>' +
          '<div class="progress" data-notify="progressbar">' +
          '<div class="progress-bar progress-bar-{0}" role="progressbar" ' +
          'aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
          '</div>' +
          '<a href="{3}" target="{4}" data-notify="url"></a>' +
          '</div>'
      }
    );
  }
}
