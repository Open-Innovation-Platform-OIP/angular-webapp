import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { AuthService } from "./auth.service";
import { AnalysisScheme } from "aws-sdk/clients/cloudsearch";

export interface User {
  id?: Number;
  email?: String;
  password?: String;
  token?: String;

  name: String;
  organization: String;
  qualification: String;
  photo_url: any;
  phone_number: String;
  location: String;
  is_ngo: Boolean;
  is_innovator: Boolean;
  is_expert: Boolean;
  is_government: Boolean;
  is_funder: Boolean;
  is_beneficiary: Boolean;
  is_incubator: Boolean;
  is_entrepreneur: Boolean;
}

// id: "",
//     email: "",
//     token: "",
//     password: "",
//     name: "",
//     organization: "",
//     qualification: "",
//     photo_url: {},
//     phone_number: "",
//     location: "",
//     is_ngo: false,
//     is_innovator: false,
//     is_expert: false,
//     is_government: false,
//     is_funder: false,
//     is_beneficiary: false,
//     is_incubator: false,
//     is_entrepreneur: false

@Injectable({
  providedIn: "root"
})
export class UsersService {
  public allOrgs: any = new Set();
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
    console.log("test");
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
      `
        // pollInterval: 500
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
        `
        // pollInterval: 500
      })
      .valueChanges.subscribe(({ data }) => {
        if (data.users.length > 0) {
          data.users.map(user => {
            if (user.organization) {
              this.allOrgs.add(user.organization);
              // this.allOrgs = Array.from(this.allOrgs);
              // console.log(this.allOrgs, "all orgs");
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
              organization
            }
          }
        `
        // pollInterval: 500
      })
      .valueChanges.subscribe(({ data }) => {
        if (data.users.length > 0) {
          data.users.map(user => {
            if (user.id && user.name) {
              // console.log(user.name);
              this.allUsers[user.id] = {
                id: user.id,
                value: user.name
              };
            }
            if (user.organization) {
              this.allUsers[user.id].organization = user.organization;
            }
          });
        }
      });
  }

  submitUserToDB(userData: User) {
    console.log(userData, "user Data on edit testing");
    return this.apollo.mutate({
      mutation: gql`
        mutation upsert_users($users: [users_insert_input!]!) {
          insert_users(
            objects: $users
            on_conflict: {
              constraint: users_pkey
              update_columns: [
                name
                organization
                qualification
                location
                photo_url
                phone_number
                is_ngo
                is_innovator
                is_entrepreneur
                is_expert
                is_incubator
                is_funder
                is_government
                is_beneficiary
                edited_at
              ]
            }
          ) {
            affected_rows
            returning {
              id
            }
          }
        }
      `,
      variables: {
        users: [userData]
      }
    });
  }
}
