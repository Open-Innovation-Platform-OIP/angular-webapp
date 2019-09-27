import { Component, OnInit } from "@angular/core";
import { TableData } from "../md/md-table/md-table.component";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { take } from "rxjs/operators";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-admin-view",
  templateUrl: "./admin-view.component.html",
  styleUrls: ["./admin-view.component.css"]
})
export class AdminViewComponent implements OnInit {
  public userDataTable: TableData;
  tests = [1, 2, 3, 4];
  public allUsers = {};

  constructor(private apollo: Apollo, private authService: AuthService) {}

  ngOnInit() {
    // this.tableData1 = {
    //   headerRow: ["Name", "Organization", "Admin"],
    //   dataRows: [
    //     ["Dakota Rice", "Niger"],
    //     ["Minerva Hooper", "Curaçao"],
    //     ["Sage Rodriguez", "Netherlands"],
    //     ["Philip Chaney", "Korea, South"],
    //     ["Doris Greene", "Malawi"],
    //     ["Mason Porter", "Chile"]
    //   ]
    // };

    this.getUsersFromDB()
      .then(value => {
        this.allUsers = value;
        // console.log(this.allUsers, "all users");
        this.generateUserTable(this.allUsers);
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

  public getUsersFromDB() {
    return new Promise((resolve, reject) => {
      this.apollo
        .watchQuery<any>({
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
          fetchPolicy: "network-only"
        })
        .valueChanges.subscribe(
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
                
              }
            }
            
          }
        `
      })
      .subscribe(
        data => {
          // console.log(data);
        },
        error => {
          console.log(error);
        }
      );
  }
}
