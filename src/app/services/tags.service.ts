import { Injectable } from '@angular/core';
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
@Injectable({
  providedIn: 'root'
})
export class TagsService {
  public allTags = {};

  constructor(private apollo: Apollo) { }
  getTagsFromDB() {
    this.apollo
      .watchQuery<any>({
        query: gql`
          query {
            tags {
              id
              name
            }
          }
        `
      })
      .valueChanges.subscribe(({ data }) => {
        if (data.tags.length> 0) {
          data.tags.map(tag => {
            this.allTags[tag.name] = tag;
          })
        }
      });
  }
}
