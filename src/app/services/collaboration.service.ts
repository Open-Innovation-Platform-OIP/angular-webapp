import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Timestamp } from "aws-sdk/clients/kinesisanalytics";

export interface collaborator {
  intent: String;
  timestamp?: Timestamp;
  edited_at?: boolean;
  problem_id?: number;
  user_id?: number;
  is_ngo: boolean;
  is_innovator: boolean;
  is_entrepreneur: boolean;
  is_expert: boolean;
  is_government: boolean;
  is_beneficiary: boolean;
  is_incubator: boolean;
  is_funder: boolean;
}

@Injectable({
  providedIn: "root"
})
export class CollaborationService {
  constructor(private apollo: Apollo) {}

  submitCollaboratorToDB(collaborationData: collaborator) {
    console.log(collaborationData, "collab data");
    console.log(collaborationData, "collab data 22");
    const upsert_collaborators = gql`
      mutation upsert_collaborators(
        $collaborators: [collaborators_insert_input!]!
      ) {
        insert_collaborators(
          objects: $collaborators
          on_conflict: {
            constraint: collaborators_pkey
            update_columns: [
              intent
              is_ngo
              is_entrepreneur
              is_funder
              is_incubator
              is_government
              is_expert
              is_beneficiary
              is_innovator
            ]
          }
        ) {
          affected_rows
          returning {
            user_id
          }
        }
      }
    `;

    this.apollo
      .mutate({
        mutation: upsert_collaborators,
        variables: {
          collaborators: [collaborationData]
        }
      })
      .subscribe(
        result => {
          console.log(result, "result");
          location.reload();
        },
        error => {
          console.log("error", error);
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
