import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Timestamp } from "aws-sdk/clients/workspaces";
import swal from "sweetalert2";

export interface validation {
  comment: String;
  agree: boolean;
  files: any[];
  validated_by?: number;
  problem_id?: number;
  created_at?: Timestamp;
  edited_at?: Timestamp;
  is_deleted?: boolean;
}

@Injectable({
  providedIn: "root"
})
export class ValidationService {
  constructor(private apollo: Apollo) {
    console.log("test2");
  }

  submitValidationToDB(validationData: validation) {
    console.log(validationData, "validation data on submit");

    this.apollo
      .mutate({
        mutation: gql`
          mutation upsert_validations(
            $validations: [validations_insert_input!]!
          ) {
            insert_validations(
              objects: $validations
              on_conflict: {
                constraint: validations_pkey
                update_columns: [comment, files, agree]
              }
            ) {
              affected_rows
              returning {
                agree
              }
            }
          }
        `,
        variables: {
          validations: [validationData]
        }
      })
      .subscribe(
        data => {
          console.log(data);
          // location.reload();
        },
        err => {
          // console.log(err, "error");
          console.error(JSON.stringify(err));

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

  deleteValidation(validationData: validation) {
    console.log(validationData, "delete validation");
    // console.log(id, "ID");
    return this.apollo.mutate<any>({
      mutation: gql`
        mutation DeleteMutation($where: validations_bool_exp!) {
          delete_validations(where: $where) {
            affected_rows
            returning {
              problem_id
            }
          }
        }
      `,
      variables: {
        where: {
          validated_by: {
            _eq: validationData.validated_by
          },
          problem_id: {
            _eq: validationData.problem_id
          }
        }
      }
    });
  }

  submitSolutionValidationToDB(validationData) {
    console.log(validationData, "validation data on submit");

    this.apollo
      .mutate({
        mutation: gql`
          mutation upsert_solution_validations(
            $solution_validations: [solution_validations_insert_input!]!
          ) {
            insert_solution_validations(
              objects: $solution_validations
              on_conflict: {
                constraint: solution_validations_pkey
                update_columns: [comment, files, agree]
              }
            ) {
              affected_rows
              returning {
                agree
              }
            }
          }
        `,
        variables: {
          solution_validations: [validationData]
        }
      })
      .subscribe(
        data => {
          console.log(data);
          // location.reload();
        },
        err => {
          console.log(err, "error");
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

  deleteSolutionValidation(validationData) {
    console.log(validationData, "delete validation");
    // console.log(id, "ID");
    return this.apollo.mutate<any>({
      mutation: gql`
        mutation DeleteMutation($where: solution_validations_bool_exp!) {
          delete_solution_validations(where: $where) {
            affected_rows
            returning {
              solution_id
            }
          }
        }
      `,
      variables: {
        where: {
          validated_by: {
            _eq: validationData.validated_by
          },
          solution_id: {
            _eq: validationData.solution_id
          }
        }
      }
    });
  }
}
