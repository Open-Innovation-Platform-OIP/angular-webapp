import { Injectable } from '@angular/core';
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  public allOrgs = new Set();
  public allUsers = {};

  constructor(private apollo: Apollo) { 
    this.getOrgsFromDB();
    this.getUsersFromDB();
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
      })
      .valueChanges.subscribe(({ data }) => {
        if (data.users.length > 0) {
          data.users.map (user => {
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
        `
      })
      .valueChanges.subscribe(({ data }) => {
        if (data.users.length > 0) {
          data.users.map(user => {
            if (user.id && user.name) {
              console.log(user.name);
              this.allUsers[user.id] = {id:user.id,value:user.name};
            }
          });
        }
      });
  }
}
