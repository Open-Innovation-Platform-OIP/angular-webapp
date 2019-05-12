import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Timestamp } from "aws-sdk/clients/kinesisanalytics";
import swal from "sweetalert2";
declare var $: any;

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
    // console.log(collaborationData, "collab data");
    console.log(collaborationData, "collab data in submit");
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
          // location.reload();
          swal({
            type: "success",
            title: "Thank you for collaborating!",
            timer: 4000,
            showConfirmButton: false
          }).catch(swal.noop);
        },
        error => {
          console.log("error", error);
          console.error(JSON.stringify(error));

          swal({
            title: "Error",
            text: "Try Again",
            type: "error",
            confirmButtonClass: "btn btn-info",
            buttonsStyling: false
          }).catch(swal.noop);
        }
      );
  }

  deleteCollaboration(collaboratorData) {
    return this.apollo.mutate<any>({
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
    });
  }

  submitSolutionCollaboratorToDB(collaborationData: collaborator) {
    // console.log(collaborationData, "collab data");
    console.log(collaborationData, "collab data in submit");
    const upsert_collaborators = gql`
      mutation upsert_solution_collaborators(
        $solution_collaborators: [solution_collaborators_insert_input!]!
      ) {
        insert_solution_collaborators(
          objects: $solution_collaborators
          on_conflict: {
            constraint: solution_collaborators_pkey
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
          solution_collaborators: [collaborationData]
        }
      })
      .subscribe(
        result => {
          console.log(result, "result");
          // location.reload();
          swal({
            type: "success",
            title: "Thank you for collaborating!",
            timer: 4000,
            showConfirmButton: false
          }).catch(swal.noop);
        },
        error => {
          console.log("error", error);
          console.error(JSON.stringify(error));

          swal({
            title: "Error",
            text: "Try Again",
            type: "error",
            confirmButtonClass: "btn btn-info",
            buttonsStyling: false
          }).catch(swal.noop);
        }
      );
  }

  deleteSolutionCollaboration(collaboratorData) {
    return this.apollo.mutate<any>({
      mutation: gql`
        mutation DeleteMutation($where: solution_collaborators_bool_exp!) {
          delete_solution_collaborators(where: $where) {
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
            _eq: collaboratorData.user_id
          },
          solution_id: {
            _eq: collaboratorData.solution_id
          }
        }
      }
    });
  }
}
