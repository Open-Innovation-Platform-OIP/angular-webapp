import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
@Injectable({
  providedIn: "root"
})
export class TagsService {
  public allTags = {};

  // public upsert_tags = ;

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
        fetchPolicy: "network-only"
        // pollInterval: 500
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
    let trimmedTableName = tableName.slice(0, tableName.length - 1);
    console.log(tags, "check for tag");
    this.apollo
      .mutate({
        mutation: gql`
          mutation upsert_tags($tags: [tags_insert_input!]!) {
            insert_tags(
              objects: $tags
              on_conflict: { constraint: tags_name_key, update_columns: [] }
            ) {
              affected_rows
              returning {
                id
                name
              }
            }
          }
        `,
        variables: {
          tags: tags
        }
      })
      .subscribe(
        data => {
          let tagsToBeLinked = [];
          if (data.data.insert_tags.returning) {
            data.data.insert_tags.returning.map(tag => {
              tagsToBeLinked.push({
                tag_id: tag.id,
                [`${trimmedTableName}_id`]: tableId
              });
            });

            this.apollo
              .mutate({
                mutation: gql`
            mutation upsert_${trimmedTableName}_tags(
              $${tableName}_tags: [${tableName}_tags_insert_input!]!
            ) {
              insert_${tableName}_tags(
                objects: $${tableName}_tags
                on_conflict: {
                  constraint: ${tableName}_tags_pkey
                  update_columns: [tag_id, ${trimmedTableName}_id]
                }
              ) {
                affected_rows
                returning {
                  tag_id
                  ${trimmedTableName}_id
                }
              }
            }
          `,
                variables: {
                  [`${tableName}_tags`]: tagsToBeLinked
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

            console.log("worked", data);
          }
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

  removeTagRelation(tagId, tableId, tableName) {
    let trimmedTableName = tableName.slice(0, tableName.length - 1);
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
              _eq: tagId
            },
            [`${trimmedTableName}_id`]: {
              _eq: tableId
            }
          }
        }
      })
      .subscribe(
        ({ data }) => {
          console.log("worked", data);
          // location.reload();
          // location.reload();
          // this.router.navigateByUrl("/problems");

          return;
        },
        error => {
          console.log("Could delete due to " + error);
        }
      );
  }
}
