import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy
} from '@angular/core';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormGroup
} from '@angular/forms';
import { FormBuilder, AbstractControl } from '@angular/forms';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { ErrorStateMatcher } from '@angular/material/core';
import { UsersService } from '../../services/users.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';
import swal from 'sweetalert2';
import { TableData } from '../../md/md-table/md-table.component';
import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';

import {
  MatAutocompleteSelectedEvent,
  MatChipInputEvent,
  MatAutocomplete
} from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-invite-user',
  templateUrl: './invite-user.component.html',
  styleUrls: ['./invite-user.component.css']
})
export class InviteUserComponent implements OnInit, OnDestroy {
  userInviteForm: FormGroup;

  public invitedUsersDataTable: TableData;
  public invitedUsersQuery: QueryRef<any>;
  public invitedUsersSubscription: Subscription;

  @ViewChild('orgsInput') orgsInput: ElementRef<HTMLInputElement>;

  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  orgsCtrl = new FormControl();

  public orgs = [];
  public removable = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  public filteredOrgs: Observable<any[]>;

  constructor(
    private formBuilder: FormBuilder,
    public usersService: UsersService,
    private authService: AuthService,
    private http: HttpClient,
    private apollo: Apollo
  ) {
    this.userInviteForm = this.formBuilder.group({
      email: new FormControl('', [Validators.email]),

      name: new FormControl('', [Validators.required])
    });
    this.filteredOrgs = this.orgsCtrl.valueChanges.pipe(
      startWith(null),
      map((org: string | null) =>
        org ? this._filter(org) : Object.keys(this.usersService.allOrgs).slice()
      )
    );
  }

  ngOnInit() {
    this.getInvitedUsersFromDB();

    this.userInviteForm = this.formBuilder.group({
      email: new FormControl('', [Validators.email]),

      name: new FormControl('', [Validators.required])
    });
  }

  generateInvitedUsersDataTable(invitedUserData) {
    const userHeaderRow = [
      'Name',
      'Invitee Email',
      'Organization',
      'Status',
      'Invited By'
    ];
    let userDataRow = [];
    invitedUserData.map(user => {
      // console.log(user, "gnerate user table");
      userDataRow.push([
        user['name'],
        user['email'],
        user['organizationByOrganization']
          ? user['organizationByOrganization']['name']
          : null,

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
        console.log(data, 'invited users data');
        if (data.invited_users.length > 0) {
          this.generateInvitedUsersDataTable(data.invited_users);
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  addOrg(event: MatChipInputEvent): void {
    // Add sector only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event

    if (!this.orgs.length) {
      if (!this.matAutocomplete.isOpen) {
        const input = event.input;
        const value = event.value;
        // Add our sector
        if ((value || '').trim()) {
          this.orgs.push(value.trim().toUpperCase());
        }
        // Reset the input value
        if (input) {
          input.value = '';
        }
        this.orgsCtrl.setValue(null);
      }
    }
  }

  selectedOrg(event: MatAutocompleteSelectedEvent): void {
    if (!this.orgs.length) {
      this.orgs.push(event.option.value);
      this.orgsInput.nativeElement.value = '';
      this.orgsCtrl.setValue(null);
      console.log(this.orgs, 'orgs');
    }

    // this.announcement(`Added ${event.option.value.value}`);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return Object.keys(this.usersService.allOrgs).filter(
      org => org.toLowerCase().indexOf(filterValue) === 0
    );
  }

  removeOrg(org) {
    const index = this.orgs.indexOf(org);
    if (index >= 0) {
      this.orgs.splice(index, 1);
      // this.removed.emit(owner);
      // this.announcement(`Removed ${owner.value || owner.name}`);
    }
  }

  // inviteUser() {
  //   if (!this.userInviteForm.valid) {
  //     return;
  //   }
  // }

  inviteUser() {
    if (!this.userInviteForm.valid || !this.orgs.length) {
      return;
    }
    console.log(this.usersService.allOrgs, 'orgs');
    let email = this.userInviteForm.value.email;
    let name = this.userInviteForm.value.name;
    console.log(email, 'email');
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
          console.log(data);

          this.updateInvitedUser(this.orgs, email, name);
        },
        error => {
          console.log(error);
        }
      );
  }

  updateInvitedUser(orgArray, email, name) {
    if (this.usersService.allOrgs[orgArray[0]]) {
      let orgId = this.usersService.allOrgs[orgArray[0]].id;
      this.apollo
        .mutate({
          mutation: gql`
            mutation update_invited_users {
              update_invited_users(
                where: { email: { _eq: "${email}" } }
                _set: {
                  name: "${name}"
                  organization: ${orgId}
                 
                }
              ) {
                affected_rows
                returning {
                  id
                  name
                 
                }
              }
            }
          `
        })
        .pipe(take(1))
        .subscribe(
          data => {
            this.userInviteForm.reset();
            this.orgs = [];
            swal({
              type: 'success',
              title: `Invite sent`,
              timer: 2000,
              showConfirmButton: false
            }).catch(swal.noop);
          },
          err => {
            console.log(err, "couldn't add tags");
          }
        );
    } else {
      this.apollo
        .mutate({
          mutation: gql`
            mutation insert_organizations {
              insert_organizations(
                objects: [
                  {
                    
                    name: "${orgArray[0]}",
                  
                  }
                ]
              ) {
                affected_rows
                returning {
                  id
                  name
                 
                }
              }
            }
          `
        })
        .pipe(take(1))
        .subscribe(
          data => {
            console.log(data, 'data');
            let organizationId = data.data.insert_organizations.returning[0].id;

            this.apollo
              .mutate({
                mutation: gql`
                mutation update_invited_users {
                  update_invited_users(
                    where: { email: { _eq: "${email}" } }
                    _set: {
                      name: "${name}"
                      organization: ${organizationId}

                    }
                  ) {
                    affected_rows
                    returning {
                      id
                      name

                    }
                  }
                }
              `
              })
              .pipe(take(1))
              .subscribe(
                data => {
                  this.userInviteForm.reset();
                  this.orgs = [];
                  swal({
                    type: 'success',
                    title: `Invite sent`,
                    timer: 1500,
                    showConfirmButton: false
                  }).catch(swal.noop);
                },
                err => {
                  console.log(err, "couldn't add tags");
                }
              );
          },
          err => {
            console.log(err, "couldn't add tags");
          }
        );
    }
  }

  ngOnDestroy() {
    this.invitedUsersQuery.stopPolling();

    this.invitedUsersSubscription.unsubscribe();
  }
}
// }
