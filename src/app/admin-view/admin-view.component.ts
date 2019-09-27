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

  public allUsers = {};
  usersQuery: QueryRef<any>;
  usersSubscription: Subscription;

  constructor(private apollo: Apollo, private authService: AuthService) {}

  ngOnInit() {
    this.getUsersFromDB()
      .then(value => {
        this.allUsers = value;
        // console.log(this.allUsers, "all users");
        this.generateUserTable(this.allUsers);
        console.log(value);
      })
      .catch(error => {
        console.log(error);
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

  getUsersFromDB() {
    return new Promise((resolve, reject) => {
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
        // pollInterval: 500
        pollInterval: 2000,

        fetchPolicy: "network-only"
      });

      this.usersSubscription = this.usersQuery.valueChanges.subscribe(
        ({ data }) => {
          let allUsers = {};
          if (data.users.length > 0) {
            data.users.map(user => {
              if (user.id !== this.authService.currentUserValue.id) {
                if (user.id && user.name) {
                  // console.log(user.name);
                  allUsers[user.id] = {
                    id: user.id,
                    name: user.name,
                    is_admin: user.is_admin,
                    organization: "Nil"
                  };
                }
                if (user.organizationByOrganizationId) {
                  allUsers[user.id].organization =
                    user.organizationByOrganizationId.name;
                }
              }
            });

            resolve(allUsers);
          }
        },
        error => {
          reject(error);
        }
      );
    });
  }

  adminToggle(event, user) {
    // console.log(user, event);
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
    // this.userProblemViewQuery.stopPolling();
    // this.userProblemViewSubscription.unsubscribe();
    this.usersQuery.stopPolling();
    this.usersSubscription.unsubscribe();
  }
}
