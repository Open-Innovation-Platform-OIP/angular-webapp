import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
@Injectable({
  providedIn: "root"
})
export class TagsService {
  public allTags = {};

  public upsert_tags = gql`
    mutation upsert_tags($tags: [tags_insert_input!]!) {
      insert_tags(
        objects: $tags
        on_conflict: { constraint: tags_pkey, update_columns: [] }
      ) {
        affected_rows
        returning {
          id
          name
        }
      }
    }
  `;

  constructor(private apollo: Apollo) {}
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
        `,
        pollInterval: 500
      })
      .valueChanges.subscribe(({ data }) => {
        if (data.tags.length > 0) {
          data.tags.map(tag => {
            this.allTags[tag.name] = tag;
          });
        }
      });
  }
  addTagsInDb(tags, tableName, tableId?) {
    console.log(tags, "check for tag");
    this.apollo
      .mutate({
        mutation: this.upsert_tags,
        variables: {
          tags: tags
        }
      })
      .subscribe(
        data => {
          console.log("worked", data);
        },
        err => {
          console.log(err, "couldn't add tags");
        }
      );

    // tags.map(tag => {
    //   if (tag) {
    //     this.apollo
    //       .watchQuery<any>({
    //         query: gql`query { tags( where: {name: {_eq:"${
    //           tag.value
    //         }"} }){id name}}`,
    //         pollInterval: 500
    //       })
    //       .valueChanges.subscribe(({ data }) => {
    //         console.log(data.tags, "tags presnt in db");
    //         if (data.tags.length > 0) {
    //           this.addRelationToTags(tableId, data.tags[0].id, tableName);
    //         } else if (data.tags.length === 0) {
    //           console.log(tag.value, "tag value");

    //           this.apollo
    //             .mutate<any>({
    //               mutation: gql`mutation insert_tags {
    //           insert_tags(
    //             objects: [
    //               {name:"${tag.value}"}
    //             ]
    //           ) {
    //             returning {
    //               id
    //               name
    //             }
    //           }
    //         }`
    //             })
    //             .subscribe(data => {
    //               this.addRelationToTags(
    //                 tableId,
    //                 data.data.insert_tags.returning[0].id,
    //                 tableName
    //               );
    //             });
    //         }
    //       });
    //   }
    // });
  }
  addRelationToTags(tableId, tagId, tableName) {
    console.log(tableId, tagId, tableName, "tableId", "tagId", "tableName");
    let table = tableName.slice(0, tableName.length - 1);
    this.apollo
      .mutate<any>({
        mutation: gql`mutation insert_${tableName}_tags {
        insert_${tableName}_tags(
          objects: [
            { ${table}_id:"${tableId}",
              tag_id:"${tagId}"
          },
            
          ]
        ) {
          returning {
            tag_id
            
          }
        }
      }`
      })
      .subscribe(
        data => {
          console.log(data, "tag addition");
        },
        error => {
          console.log("error", error);
        }
      );
  }

  removeTagRelations(tagsToBeRemoved, tableName) {
    tagsToBeRemoved.map(tag => {
      this.apollo
        .mutate<any>({
          mutation: gql`
            mutation DeleteMutation($where: ${tableName}_tags_bool_exp!) {
              delete_${tableName}_tags(where: $where) {
                affected_rows
                returning {
                  tag_id
                }
              }
            }
          `,
          variables: {
            where: {
              tag_id: {
                _eq: tag.id
              }
            }
          }
        })
        .subscribe(
          ({ data }) => {
            console.log(data, "remove tags");
            // location.reload();
            // this.router.navigateByUrl("/problems");

            return;
          },
          error => {
            console.log("Could delete due to " + error);
          }
        );
    });
  }
}
