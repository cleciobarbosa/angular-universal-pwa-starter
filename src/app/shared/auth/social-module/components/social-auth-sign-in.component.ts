import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { RecaptchaComponent } from 'ng-recaptcha';
import { MatSnackBar } from '@angular/material';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { AuthService } from '../../auth.service';
import { SocialAuthService } from '../social-auth.service';

@Component({
    selector: 'app-social-auth-sign-in',
    templateUrl: 'social-auth-sign-in.component.html',
})
export class SocialAuthSignInComponent implements OnInit, OnDestroy {
    form: FormGroup;
    destroy: Subject<any> = new Subject();
    @ViewChild('recaptcha') recaptcha: RecaptchaComponent;

    constructor(
        private fb: FormBuilder,
        private socialAuthService: SocialAuthService,
        public auth: AuthService,
        public router: Router,
        private snackbar: MatSnackBar
    ) {}

    ngOnInit() {
        this.form = this.fb.group({
            recaptcha: [null, Validators.required],
        });

        this.auth.user$.takeUntil(this.destroy).subscribe(user => {
            if (user === null) {
            } else if (this.auth.isAuthenticatedUser(user) && !user.isAnonymous) {
                this.router.navigate(['/account']);
            } else if (this.auth.isHttpErrorResponse(user)) {
                this.auth.errorHandled();
                this.recaptcha.reset();
                this.snackbar.open(`Unknown error, sorry about that.`, `OK`, {
                    duration: 5000,
                });
            }
        });
    }

    signInWithGoogle() {
        this.socialAuthService.signIn('google');
    }

    signInWithFacebook() {
        this.socialAuthService.signIn('facebook');
    }

    ngOnDestroy() {
        this.destroy.next();
    }
}
