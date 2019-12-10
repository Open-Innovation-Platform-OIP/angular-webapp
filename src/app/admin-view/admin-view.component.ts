import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';
import { TableData } from '../md/md-table/md-table.component';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomainAddModalComponent } from '../components/domain-add-modal/domain-add-modal.component';
import { FilterService } from '../services/filter.service';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { FocusMonitor } from '@angular/cdk/a11y';

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css']
})
export class AdminViewComponent implements OnInit, OnDestroy {
  @ViewChild('usersHeading') userHeading: ElementRef<HTMLElement>;

  public userDataTable: TableData;
  public unapprovedUserDataTable: TableData;
  public invitedUsersDataTable: TableData;

  objectKeys = Object.keys;

  allUsers = {};
  allUnapprovedUsers = {};

  inviteeEmail: String = '';

  usersQuery: QueryRef<any>;
  invitedUsersQuery: QueryRef<any>;

  usersSubscription: Subscription;
  invitedUsersSubscription: Subscription;

  userInviteForm: FormGroup;

  constructor(
    private apollo: Apollo,
    private authService: AuthService,
    private http: HttpClient,
    public dialog: MatDialog,
    public filterService: FilterService,
    private focusMonitor: FocusMonitor
  ) {}

  ngOnInit() {
    this.getUsersFromDB();
    this.getInvitedUsersFromDB();

    this.userInviteForm = new FormGroup({
      email: new FormControl('', [Validators.email])
    });

    this.setFocus(this.userHeading, 1000);
  }

  setFocus(elem: ElementRef, time: number) {
    setTimeout(() => {
      this.focusMonitor.focusVia(elem, 'program');
    }, time);
  }

  openDomainAddModal(): void {
    const domainAddRef = this.dialog.open(DomainAddModalComponent, {
      width: '500px',
      data: {}
    });

    domainAddRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  generateUserTable(userData) {
    const userHeaderRow = [
      'Email',
      'Name',
      'Organization',
      'Admin',
      'Approval Status'
    ];
    const userDataRow = [];
    Object.values(userData).map(user => {
      userDataRow.push([
        user['email'],
        user['name'].toUpperCase(),
        user['organization'].toUpperCase(),
        user['is_admin'],

        user['is_approved'],
        user['id']
      ]);
    });
    this.userDataTable = {
      headerRow: userHeaderRow,
      dataRows: userDataRow
    };
  }

  generateUnapprovedUserTable(userData) {
    const userHeaderRow = ['Email', 'Approve'];
    const userDataRow = [];
    Object.values(userData).map(user => {
      userDataRow.push([user['email'], user['is_approved'], user['id']]);
    });
    this.unapprovedUserDataTable = {
      headerRow: userHeaderRow,
      dataRows: userDataRow
    };
  }

  generateInvitedUsersDataTable(invitedUserData) {
    const userHeaderRow = ['Invitee Email', 'Status', 'Invited By'];
    const userDataRow = [];
    invitedUserData.map(user => {
      userDataRow.push([
        user['name'],
        user['email'],
        user['organizationByOrganization']['name'],

        user['accepted'] ? 'Accepted' : 'Pending',
        user['admin_invited'] ? 'Admin' : 'User'
      ]);
    });
    this.invitedUsersDataTable = {
      headerRow: userHeaderRow,
      dataRows: userDataRow
    };
  }

  getInvitedUsersFromDB() {
    this.invitedUsersQuery = this.apollo.watchQuery<any>({
      query: gql`
        query {
          invited_users {
            email
            accepted
            admin_invited
            name
            organizationByOrganization {
              name
            }
            id
          }
        }
      `,

      pollInterval: 2000,

      fetchPolicy: 'network-only'
    });

    this.invitedUsersSubscription = this.invitedUsersQuery.valueChanges.subscribe(
      ({ data }) => {
        if (data.invited_users.length > 0) {
          this.generateInvitedUsersDataTable(data.invited_users);
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  getUsersFromDB() {
    this.usersQuery = this.apollo.watchQuery<any>({
      query: gql`
        query {
          users {
            is_admin
            id
            name
            is_approved
            email

            organizationByOrganizationId {
              name
            }
          }
        }
      `,

      pollInterval: 2000,

      fetchPolicy: 'network-only'
    });

    this.usersSubscription = this.usersQuery.valueChanges.subscribe(
      ({ data }) => {
        this.allUsers = {};
        this.allUnapprovedUsers = {};
        if (data.users.length > 0) {
          data.users.map(user => {
            if (user.id !== this.authService.currentUserValue.id) {
              if (user.id && user.name) {
                this.allUsers[user.id] = {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  is_admin: user.is_admin,
                  organization: 'Nil',
                  is_approved: user.is_approved
                };
              }
              if (!user.is_approved) {
                this.allUnapprovedUsers[user.id] = {
                  id: user.id,
                  name: user.name,
                  is_admin: user.is_admin,
                  email: user.email,
                  is_approved: user.is_approved
                };
              }
              if (user.organizationByOrganizationId) {
                this.allUsers[user.id].organization =
                  user.organizationByOrganizationId.name;
              }
            }
          });

          this.generateUserTable(this.allUsers);
          this.generateUnapprovedUserTable(this.allUnapprovedUsers);
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  adminToggle(event, user) {
    const userId = user[5];
    const isAdmin = event.checked;
    this.updateUserAdminStatus(isAdmin, userId);
  }

  updateUserAdminStatus(isAdmin, userId) {
    this.apollo
      .mutate({
        mutation: gql`
          mutation update_users{
            update_users(
              where: {id: {_eq: ${userId}}},
              _set: {
               is_admin:${isAdmin}
              }
            ) {
              affected_rows
              returning {
                id
                is_admin
                name

              }
            }

          }
        `
      })
      .pipe(take(1))
      .subscribe(
        data => {
          const user = data.data.update_users.returning[0];

          if (user.is_admin) {
            swal({
              type: 'success',
              title: `${user.name} is now an admin.`,
              timer: 1500,
              showConfirmButton: false
            }).catch(swal.noop);
          }
        },
        error => {
          console.error(error);
        }
      );
  }

  inviteUser() {
    if (!this.userInviteForm.valid) {
      return;
    }
    const email = this.userInviteForm.value.email;

    this.http
      .post(
        'https://invite-flow-microservice-test.dev.jaagalabs.com/invite_user',
        {
          email: email,
          sender_id: this.authService.currentUserValue['id'],
          sender_email: this.authService.currentUserValue['email'],
          url: ''
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
        }
      );
  }

  approveUserToggle(event, user) {
    const userId = user[5];
    const isApproved = event.checked;

    this.apollo
      .mutate({
        mutation: gql`
          mutation update_users{
            update_users(
              where: {id: {_eq: ${userId}}},
              _set: {
               is_approved:${isApproved}
              }
            ) {
              affected_rows
              returning {
                id
                is_admin
                email
                name
                is_approved

              }
            }

          }
        `
      })
      .pipe(take(1))
      .subscribe(
        data => {
          const user = data.data.update_users.returning[0];

          if (user.is_approved) {
            swal({
              type: 'success',
              title: `${user.email} is approved.`,
              timer: 1500,
              showConfirmButton: false
            }).catch(swal.noop);
          }
        },
        error => {
          console.error(error);
        }
      );
  }

  sendEmailToApprovedUser(email) {
    this.http
      .post(
        'https://invite-flow-microservice-test.dev.jaagalabs.com/user_approved',
        {
          email: email
        }
      )
      .subscribe(
        data => {},
        error => {
          console.error(error);
        }
      );
  }

  approveUser(event, user) {
    const userId = user[2];
    const isApproved = event.checked;

    this.apollo
      .mutate({
        mutation: gql`
          mutation update_users{
            update_users(
              where: {id: {_eq: ${userId}}},
              _set: {
               is_approved:true
              }
            ) {
              affected_rows
              returning {
                id
                is_admin
                email
                name
                is_approved

              }
            }

          }
        `
      })
      .pipe(take(1))
      .subscribe(
        data => {
          const user = data.data.update_users.returning[0];

          if (user.is_approved) {
            this.sendEmailToApprovedUser(user.email);

            swal({
              type: 'success',
              title: `${user.email} is approved.`,
              timer: 1500,
              showConfirmButton: false
            }).catch(swal.noop);
          }
        },
        error => {
          console.error(error);
        }
      );
  }

  ngOnDestroy() {
    this.usersQuery.stopPolling();
    this.invitedUsersQuery.stopPolling();

    this.usersSubscription.unsubscribe();
    this.invitedUsersSubscription.unsubscribe();
  }
}
