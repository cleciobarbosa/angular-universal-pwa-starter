import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

import { MatSnackBar } from '@angular/material';

import { AuthenticatedUser } from '@interfaces/authenticated-user.interface';

import { AuthService } from '../../auth.service';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
    destroy: Subject<any> = new Subject();
    form: FormGroup;
    showOldPassword = false;
    showNewPassword = false;
    @Output() passwordChanged: EventEmitter<any> = new EventEmitter<any>();

    constructor(public auth: AuthService, private fb: FormBuilder, private snackbar: MatSnackBar) {}

    ngOnInit() {
        this.form = this.fb.group({
            oldPassword: ['', Validators.required],
            newPassword: ['', Validators.required],
        });
    }

    toggleShowOldPassword() {
        this.showOldPassword = !this.showOldPassword;
    }

    toggleShowNewPassword() {
        this.showNewPassword = !this.showNewPassword;
    }

    changePassword(): void {
        this.auth
            .changePassword({ ...this.form.value })
            .pipe(take(1))
            .subscribe(() => this.passwordChanged.emit(), error => this.handlePasswordError(error));
    }

    handlePasswordError(error: HttpErrorResponse) {
        if (Array.isArray(error.error)) {
            this.form.patchValue({ newPassword: '' });
            switch (error.error[0]) {
                case 'min':
                    return this.snackbar.open(`Password is too short`, `OK`, {
                        duration: 5000,
                    });

                case 'oneOf':
                    return this.snackbar.open(`Pick a better password`, `OK`, {
                        duration: 5000,
                    });

                default:
                    return this.snackbar.open(`${error.error[0]}`, `OK`, {
                        duration: 5000,
                    });
            }
        }
        this.form.patchValue({ oldPassword: '' });
        return this.snackbar.open(`${error.error}`, `OK`, { duration: 5000 });
    }

    ngOnDestroy() {
        this.destroy.next();
    }
}
