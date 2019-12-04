import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import swal from 'sweetalert2';
import {
  Location,
  LocationStrategy,
  PathLocationStrategy
} from '@angular/common';
import { domain } from '../../../environments/environment';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  userInviteModalForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    private http: HttpClient,
    public ngLocation: Location,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit() {
    this.userInviteModalForm = new FormGroup({
      email: new FormControl('', [Validators.email])
    });
  }

  inviteUser() {
    if (!this.userInviteModalForm.valid) {
      return;
    }
    let email = this.userInviteModalForm.value.email;

    this.http
      .post(
        'https://invite-flow-microservice-test.dev.jaagalabs.com/invite_user',
        {
          email: email,
          sender_id: this.authService.currentUserValue['id'],
          sender_email: this.authService.currentUserValue['email'],
          url: domain + this.ngLocation.path()
        }
      )
      .subscribe(
        data => {
          swal({
            type: 'success',
            title: `Invite sent`,
            timer: 1500,
            showConfirmButton: false
          }).catch(swal.noop);
        },
        error => {
          console.error(error);
          swal({
            type: 'error',
            title: 'Oops',
            text: `${error.error.message}`,
            timer: 1500,
            showConfirmButton: false
          }).catch(swal.noop);
        }
      );
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
