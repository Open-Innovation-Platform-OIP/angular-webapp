import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { AuthService } from "./auth.service";

export interface Comment {
  id?: number; // new comments will automatically get ids from PostgreSQL. Edits will have an id.
  created_by: number; // user_id
  problem_id?: number; // linked problem
  solution_id?: number; // linked solution
  text: String; // text/html for comment
  linked_comment_id?: number; // include parent comment id if this is a reply
  mentions?: String;
  attachments?: String[];
}

@Injectable({
  providedIn: "root"
})
export class DiscussionsService {
  constructor(private apollo: Apollo, private auth: AuthService) { }

  submitCommentToDB(comment: Comment) {
    console.log("comment>>>> ", comment);

    if (!(comment.problem_id || comment.solution_id)) {
      console.log("cannot continue without problem or solution id");
      return false;
    }
    comment.created_by = this.auth.currentUserValue.id;
    const upsert_comment = gql`
      mutation upsert_comment($discussions: [discussions_insert_input!]!) {
        insert_discussions(
          objects: $discussions
          on_conflict: {
            constraint: discussions_pkey
            update_columns: [text, mentions, modified_at]
          }
        ) {
          affected_rows
          returning {
            id
            text
          }
        }
      }
    `;
    this.apollo
      .mutate({
        mutation: upsert_comment,
        variables: {
          discussions: [comment]
        }
      })
      .subscribe(
        result => {
          if (result.data.insert_discussions.returning.length > 0) {
            console.log(result.data.insert_discussions);
          }
        },
        err => {
          console.error(JSON.stringify(err));
        }
      );
  }

  getComments(id, is_problem = true) {
    let query = `{
          discussions(where: { problem_id: { _eq: ${id} } }) {
            id
            title
          }
        }`;
    if (!is_problem) {
      query.replace("problem_id", "solution_id");
    }
    return this.apollo.watchQuery<any>({
      query: gql`
        {
          discussions(where: { problem_id: { _eq: ${id} } }, order_by:{created_at:desc}) {
            id
            created_by
            created_at
            modified_at
            text
            linked_comment_id
            mentions
            usersBycreatedBy{
              name
              photo_url
            }
          }
        }
      `,
      pollInterval: 500
    }).valueChanges;
  }
}
