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
    resetDetails = {
        email: '',
        otp: '',
        password: '',
        confirmPassword: '',
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
        private router: Router,
    ) {
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
    }

    ngOnInit() {
        var navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        const body = document.getElementsByTagName('body')[0];
        body.classList.add('login-page');
        body.classList.add('off-canvas-sidebar');
        const card = document.getElementsByClassName('card')[0];
        setTimeout(function () {
            // after 1000 ms we add the class animated to the login/register card
            card.classList.remove('card-hidden');
        }, 700);
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }
    sidebarToggle() {
        var toggleButton = this.toggleButton;
        var body = document.getElementsByTagName('body')[0];
        var sidebar = document.getElementsByClassName('navbar-collapse')[0];
        if (this.sidebarVisible == false) {
            setTimeout(function () {
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
        if (isEmail(this.resetDetails.email) && this.resetDetails.otp.length >= 4 && this.resetDetails.password.length >= 4 && this.resetDetails.password === this.resetDetails.confirmPassword) {
            return true;
        }
        return false;
    }
    done(err, res) {
        if (err) console.error(err);
        if (res) console.log(res);
    }
    submit() {
        this.submitted = true;
        this.loading = true;
        // this.auth.login(this.resetDetails, this.done);
        this.auth.login(this.resetDetails)
            .pipe(first())
            .subscribe(
                data => {
                    this.router.navigate([this.returnUrl]);
                },
                error => {
                    this.error = error;
                    this.loading = false;
                });
    }
}
