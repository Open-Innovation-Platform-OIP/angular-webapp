import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";

export interface collaborator {
  intent: String;
  collaborate_as: {
    ngo: boolean;
    innovator: boolean;
    entrepreneur: boolean;
    expert: boolean;
    government: boolean;
    beneficiary: boolean;
    incubator: boolean;
    funder: boolean;
  };
}

@Injectable({
  providedIn: "root"
})
export class CollaborationService {
  constructor(private apollo: Apollo) {}

  addCollaborator(collaborationData) {
    console.log(collaborationData, "in add collab");
    this.apollo
      .mutate<any>({
        mutation: gql`
          mutation insert_collaborators(
            $objects: [collaborators_insert_input!]!
          ) {
            insert_collaborators(objects: $objects) {
              returning {
                user_id
              }
            }
          }
        `,
        variables: {
          objects: [collaborationData]
        }
      })
      .subscribe(
        data => {
          console.log(data);
          location.reload();
        },
        err => {
          console.log(err, "could not add collaborator due to");
        }
      );
  }

  updateCollaboration(collaboratorDataToBeUpdated, problemId, userId) {
    console.log(
      "collaborator data",
      collaboratorDataToBeUpdated,
      "problem id",
      problemId,
      "user id",
      userId
    );
    this.apollo
      .mutate<any>({
        mutation: gql`
          mutation updateMutation(
            $where: collaborators_bool_exp!
            $set: collaborators_set_input!
          ) {
            update_collaborators(where: $where, _set: $set) {
              affected_rows
              returning {
                user_id
              }
            }
          }
        `,
        variables: {
          where: {
            user_id: {
              _eq: userId
            },
            problem_id: {
              _eq: problemId
            }
          },
          set: {
            intent: collaboratorDataToBeUpdated.intent,
            collaborate_as: collaboratorDataToBeUpdated.collaborate_as,
            edited_at: collaboratorDataToBeUpdated.edited_at
          }
        }
      })
      .subscribe(
        data => {
          console.log(data);
          location.reload();
        },
        err => {
          console.log(err, "error");
        }
      );
  }

  deleteCollaboration(collaboratorData) {
    this.apollo
      .mutate<any>({
        mutation: gql`
          mutation DeleteMutation($where: collaborators_bool_exp!) {
            delete_collaborators(where: $where) {
              affected_rows
              returning {
                problem_id
              }
            }
          }
        `,
        variables: {
          where: {
            user_id: {
              _eq: collaboratorData.user_id
            },
            problem_id: {
              _eq: collaboratorData.problem_id
            }
          }
        }
      })
      .subscribe(
        ({ data }) => {
          // location.reload();
          location.reload();
          // this.router.navigateByUrl("/problems");

          return;
        },
        error => {
          console.log("Could delete due to " + error);
        }
      );
  }
}
