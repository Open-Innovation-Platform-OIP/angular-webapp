import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root"
})
export class UsersService {
  public allOrgs = new Set();
  public allUsers = {};
  public currentUser = {
    id: 0,
    email: "",
    name: "",
    photo_url: ""
  };

  constructor(private apollo: Apollo, private auth: AuthService) {
    this.getOrgsFromDB();
    this.getUsersFromDB();
    this.getCurrentUser();
  }

  public getCurrentUser() {
    this.apollo
      .watchQuery<any>({
        query: gql`
        {
          users(where: { id: { _eq: ${this.auth.currentUserValue.id} } }) {
            id
            name
            email
            photo_url
          }
        }
      `,
        pollInterval: 500
      })
      .valueChanges.subscribe(({ data }) => {
        if (data.users.length > 0) {
          Object.keys(this.currentUser).map(key => {
            if (data.users[0][key]) {
              this.currentUser[key] = data.users[0][key];
            }
          });
        }
      });
  }
  public getOrgsFromDB() {
    this.apollo
      .watchQuery<any>({
        query: gql`
          query {
            users {
              organization
            }
          }
        `,
        pollInterval: 500
      })
      .valueChanges.subscribe(({ data }) => {
        if (data.users.length > 0) {
          data.users.map(user => {
            if (user.organization) {
              this.allOrgs.add(user.organization);
            }
          });
        }
      });
  }

  public getUsersFromDB() {
    this.apollo
      .watchQuery<any>({
        query: gql`
          query {
            users {
              id
              name
            }
          }
        `,
        pollInterval: 500
      })
      .valueChanges.subscribe(({ data }) => {
        if (data.users.length > 0) {
          data.users.map(user => {
            if (user.id && user.name) {
              // console.log(user.name);
              this.allUsers[user.id] = { id: user.id, value: user.name };
            }
          });
        }
      });
  }
}
