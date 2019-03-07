import { Injectable } from '@angular/core';
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";

@Injectable({
  providedIn: 'root'
})
export class OrgsService {
  public allOrgs = new Set();

  constructor(private apollo: Apollo) { }
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
}
