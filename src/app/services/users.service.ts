import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { AuthService } from "./auth.service";
import { AnalysisScheme } from "aws-sdk/clients/cloudsearch";
import { take } from "rxjs/operators";

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
  notify_email: Boolean;
  notify_sms: Boolean;
  notify_app: Boolean;
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
  public allOrgs: any = {};
  public allUsers = {};
  public currentUser = {
    id: 0,
    email: "",
    name: "",
    photo_url: "",
    organization: ""
  };

  dashboardDrafts: any[] = [];
  solutionDrafts: any[] = [];
  dashboardUserProblems: any[] = [];
  dashboardContributions = {};
  dashboardRecommendations = {};
  dashboardUsers = {};
  dashboardUserSolutions = [];
  dashboardSolutionContributions = {};

  constructor(private apollo: Apollo, private auth: AuthService) {
    this.getOrgsFromDB();
    this.getUsersFromDB();
    this.getCurrentUser();
    // this.currentUser = {
    //   id: 21
    // };
  }

  public getCurrentUser() {
    if (this.auth.currentUserValue) {
      this.apollo
        .watchQuery<any>({
          query: gql`
        {
          users(where: { id: { _eq: ${this.auth.currentUserValue.id} } }) {
            id
            name
            email
            photo_url
            organizationByOrganizationId {
              name
            }

          }
        }
      `,
          fetchPolicy: "no-cache"
          // pollInterval: 500
        })
        .valueChanges.pipe(take(1))
        .subscribe(({ data }) => {
          // console.log("<<<curr user data", data);
          if (data.users.length > 0) {
            Object.keys(this.currentUser).map(key => {
              if (data.users[0][key]) {
                this.currentUser[key] = data.users[0][key];
              }
            });

            if (data.users[0].organizationByOrganizationId) {
              this.currentUser.organization =
                data.users[0].organizationByOrganizationId.name;
            }
          }
        });
    }
    // console.log(this.currentUser, "current user on user service");
  }
  public getOrgsFromDB() {
    this.apollo
      .watchQuery<any>({
        query: gql`
          query {
            organizations {
              id
              name
            }
          }
        `,
        fetchPolicy: "network-only"

        // pollInterval: 500
      })
      .valueChanges.pipe(take(1))
      .subscribe(({ data }) => {
        if (data.organizations.length > 0) {
          data.organizations.map(organization => {
            this.allOrgs[organization.name] = organization;
            // this.allOrgs = Array.from(this.allOrgs);
            // / console.log(this.allOrgs, "all orgs");
          });
        }
        // console.log(data, "data from all orgs");
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
              organizationByOrganizationId {
                name
              }
            }
          }
        `,
        // pollInterval: 500
        fetchPolicy: "network-only"
      })
      .valueChanges.pipe(take(1))
      .subscribe(({ data }) => {
        if (data.users.length > 0) {
          data.users.map(user => {
            if (user.id && user.name) {
              // console.log(user.name);
              this.allUsers[user.id] = {
                id: user.id,
                value: user.name
              };
            }
            if (user.organizationByOrganizationId) {
              this.allUsers[user.id].organization =
                user.organizationByOrganizationId.name;
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
                notify_email
                notify_sms
                notify_app
                organization_id
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
