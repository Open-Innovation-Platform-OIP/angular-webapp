import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subscription, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TagsService {
  test: Observable<any>;

  public allTags = {};
  public adminDomainAdditionTags = {};
  public allTagsArray: any[] = [];
  public sectorFilterArray = [];
  public allTagsSubscription = Subscription;

  constructor(private apollo: Apollo) {
    this.getTagsFromDBForAdmin();
  }

  getTagsFromDB(filter) {
    this.allTagsArray = [];
    this.test = this.apollo.watchQuery<any>({
      query: gql`
        query {
          tags${filter} {
            id
            name
          }
        }
      `,
      fetchPolicy: 'network-only'
    }).valueChanges;

    return new Promise((resolve, reject) => {
      this.test.pipe(take(1)).subscribe(({ data }) => {
        if (data.tags.length > 0) {
          data.tags.map(tag => {
            this.allTags[tag.name] = tag;
            this.allTagsArray.push(tag.id);
          });
        }
        resolve(this.allTags);
      });
    });
  }

  getTagsFromDBForAdmin() {
    const getTags = this.apollo.watchQuery<any>({
      query: gql`
        query {
          tags {
            id
            name
          }
        }
      `,
      fetchPolicy: 'network-only'
    }).valueChanges;

    return new Promise((resolve, reject) => {
      getTags.pipe(take(1)).subscribe(({ data }) => {
        if (data.tags.length > 0) {
          data.tags.map(tag => {
            this.adminDomainAdditionTags[tag.name] = tag;
          });
        }
        resolve(this.adminDomainAdditionTags);
      });
    });
  }

  addTagsInDb(tags, tableName, tableId?) {
    const trimmedTableName = tableName.slice(0, tableName.length - 1);

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
      .pipe(take(1))
      .subscribe(
        data => {
          const tagsToBeLinked = [];
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
              .pipe(take(1))
              .subscribe(
                data => {},
                err => {
                  console.error(err, 'couldn\'t add tags');
                }
              );
          }
        },
        err => {
          console.error(err, 'couldn\'t add tags');
        }
      );
  }
  addRelationToTags(tableId, tagId, tableName) {
    const table = tableName.slice(0, tableName.length - 1);
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
      .pipe(take(1))
      .subscribe(
        data => {},
        error => {
          console.error('error', error);
        }
      );
  }

  removeTagRelation(tagId, tableId, tableName) {
    const trimmedTableName = tableName.slice(0, tableName.length - 1);
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
      .pipe(take(1))
      .subscribe(
        ({ data }) => {
          return;
        },
        error => {
          console.error('Could delete due to ' + error);
        }
      );
  }
}
