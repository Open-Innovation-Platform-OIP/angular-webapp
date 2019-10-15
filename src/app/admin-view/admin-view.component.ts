import { Component, OnInit, OnDestroy } from "@angular/core";
import { TableData } from "../md/md-table/md-table.component";
import { Apollo, QueryRef } from "apollo-angular";
import gql from "graphql-tag";
import { take } from "rxjs/operators";
import { AuthService } from "../services/auth.service";
import swal from "sweetalert2";
import { Subscription } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { FormGroup, FormControl, Validators } from "@angular/forms";

@Component({
  selector: "app-admin-view",
  templateUrl: "./admin-view.component.html",
  styleUrls: ["./admin-view.component.css"]
})
export class AdminViewComponent implements OnInit, OnDestroy {
  public userDataTable: TableData;
  public unapprovedUserDataTable: TableData;

  objectKeys = Object.keys;

  allApprovedUsers = {};
  allUnapprovedUsers = {};

  inviteeEmail: String = "";

  usersQuery: QueryRef<any>;
  unapprovedUsersQuery: QueryRef<any>;
  usersSubscription: Subscription;
  unapprovedUsersSubscription: Subscription;

  userInviteForm: FormGroup;

  constructor(
    private apollo: Apollo,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.getUsersFromDB();
    this.getUnapprovedUsersFromDB();
    this.userInviteForm = new FormGroup({
      email: new FormControl("", [Validators.email])
    });
  }

  generateUserTable(userData) {
    const userHeaderRow = ["Name", "Organization", "Admin"];
    let userDataRow = [];
    Object.values(userData).map(user => {
      // console.log(user, "gnerate user table");
      userDataRow.push([
        user["name"].toUpperCase(),
        user["organization"].toUpperCase(),
        user["is_admin"],
        user["id"]
      ]);
    });
    this.userDataTable = {
      headerRow: userHeaderRow,
      dataRows: userDataRow
    };
  }

  generateUnapprovedUserTable(userData) {
    const userHeaderRow = ["Email", "Approve"];
    let userDataRow = [];
    Object.values(userData).map(user => {
      // console.log(user, "gnerate user table");
      userDataRow.push([user["email"], user["id"]]);
    });
    this.unapprovedUserDataTable = {
      headerRow: userHeaderRow,
      dataRows: userDataRow
    };
  }

  getUnapprovedUsersFromDB() {
    this.unapprovedUsersQuery = this.apollo.watchQuery<any>({
      query: gql`
        query {
          users(where: { is_approved: { _eq: false } }) {
            is_admin
            id
            email
            is_approved

            organizationByOrganizationId {
              name
            }
          }
        }
      `,

      pollInterval: 1000,

      fetchPolicy: "network-only"
    });

    this.unapprovedUsersSubscription = this.unapprovedUsersQuery.valueChanges.subscribe(
      ({ data }) => {
        if (data.users.length > 0) {
          this.allUnapprovedUsers = {};
          data.users.map(user => {
            if (user.id !== this.authService.currentUserValue.id) {
              if (user.id) {
                this.allUnapprovedUsers[user.id] = {
                  id: user.id,
                  name: user.name,
                  is_admin: user.is_admin,
                  email: user.email
                };
              }
              if (user.organizationByOrganizationId) {
                this.allUnapprovedUsers[user.id].organization =
                  user.organizationByOrganizationId.name;
              }
            }
          });
          console.log(this.allUnapprovedUsers);

          this.generateUnapprovedUserTable(this.allUnapprovedUsers);
        } else {
          this.allUnapprovedUsers = {};
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  getUsersFromDB() {
    this.usersQuery = this.apollo.watchQuery<any>({
      query: gql`
        query {
          users(where: { is_approved: { _eq: true } }) {
            is_admin
            id
            name
            is_approved

            organizationByOrganizationId {
              name
            }
          }
        }
      `,

      pollInterval: 4000,

      fetchPolicy: "network-only"
    });

    this.usersSubscription = this.usersQuery.valueChanges.subscribe(
      ({ data }) => {
        if (data.users.length > 0) {
          data.users.map(user => {
            if (user.id !== this.authService.currentUserValue.id) {
              if (user.id && user.name) {
                this.allApprovedUsers[user.id] = {
                  id: user.id,
                  name: user.name,
                  is_admin: user.is_admin,
                  organization: "Nil",
                  is_approved: user.is_approved
                };
              }
              if (user.organizationByOrganizationId) {
                this.allApprovedUsers[user.id].organization =
                  user.organizationByOrganizationId.name;
              }
            }
          });
          console.log(this.allApprovedUsers, "all approved");

          this.generateUserTable(this.allApprovedUsers);
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  adminToggle(event, user) {
    const userId = user[3];
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
          let user = data.data.update_users.returning[0];
          console.log(user, "data");

          if (user.is_admin) {
            swal({
              type: "success",
              title: `${user.name} is now an admin.`,
              timer: 1500,
              showConfirmButton: false
            }).catch(swal.noop);
          }

          // console.log(data);
        },
        error => {
          console.log(error);
        }
      );
  }

  inviteUser() {
    console.log(this.inviteeEmail);
    if (!this.userInviteForm.valid) {
      return;
    }
    let email = this.userInviteForm.value.email;
    console.log(email, "email");
    this.http
      .post(
        "https://invite-flow-microservice-test.dev.jaagalabs.com/invite_user",
        {
          email: email,
          is_admin: this.authService.currentUserValue["is_admin"]
        }
      )
      .subscribe(
        data => {
          console.log(data);
          swal({
            type: "success",
            title: `Invite sent`,
            timer: 1500,
            showConfirmButton: false
          }).catch(swal.noop);
        },
        error => {
          console.log(error);
        }
      );
  }

  approveUser(event, user) {
    const userId = user[1];
    console.log(user, "user id");
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
          let user = data.data.update_users.returning[0];
          console.log(user, "data");
          // this.getUnapprovedUsersFromDB();

          if (user.is_approved) {
            swal({
              type: "success",
              title: `${user.email} is approved.`,
              timer: 1500,
              showConfirmButton: false
            }).catch(swal.noop);
          }

          // console.log(data);
        },
        error => {
          console.log(error);
        }
      );
  }

  ngOnDestroy() {
    this.usersQuery.stopPolling();
    this.usersSubscription.unsubscribe();
  }
}
