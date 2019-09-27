import { Component, OnInit, OnDestroy } from "@angular/core";
import { TableData } from "../md/md-table/md-table.component";
import { Apollo, QueryRef } from "apollo-angular";
import gql from "graphql-tag";
import { take } from "rxjs/operators";
import { AuthService } from "../services/auth.service";
import swal from "sweetalert2";
import { Subscription } from "rxjs";

@Component({
  selector: "app-admin-view",
  templateUrl: "./admin-view.component.html",
  styleUrls: ["./admin-view.component.css"]
})
export class AdminViewComponent implements OnInit, OnDestroy {
  public userDataTable: TableData;
  allUsers = {};

  usersQuery: QueryRef<any>;
  usersSubscription: Subscription;

  constructor(private apollo: Apollo, private authService: AuthService) {}

  ngOnInit() {
    this.getUsersFromDB();
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

  getUsersFromDB() {
    this.usersQuery = this.apollo.watchQuery<any>({
      query: gql`
        query {
          users {
            is_admin
            id
            name

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
                this.allUsers[user.id] = {
                  id: user.id,
                  name: user.name,
                  is_admin: user.is_admin,
                  organization: "Nil"
                };
              }
              if (user.organizationByOrganizationId) {
                this.allUsers[user.id].organization =
                  user.organizationByOrganizationId.name;
              }
            }
          });

          this.generateUserTable(this.allUsers);
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

  ngOnDestroy() {
    this.usersQuery.stopPolling();
    this.usersSubscription.unsubscribe();
  }
}
