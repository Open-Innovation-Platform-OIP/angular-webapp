import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Timestamp } from 'aws-sdk/clients/workspaces';
import swal from 'sweetalert2';
import { take } from 'rxjs/operators';

export interface validation {
  comment: String;
  agree: boolean;
  files: any[];
  user_id?: number;
  problem_id?: number;
  created_at?: Timestamp;
  edited_at?: Timestamp;
  is_deleted?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  constructor(private apollo: Apollo) {}

  submitProblemValidationToDB(validationData: validation) {
    this.apollo
      .mutate({
        mutation: gql`
          mutation upsert_problem_validations(
            $problem_validations: [problem_validations_insert_input!]!
          ) {
            insert_problem_validations(
              objects: $problem_validations
              on_conflict: {
                constraint: problem_validations_pkey
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
          problem_validations: [validationData]
        }
      })
      .pipe(take(1))
      .subscribe(
        data => {},
        err => {
          console.error(JSON.stringify(err));

          swal({
            title: 'Error',
            text: 'Try Again',
            type: 'error',
            confirmButtonClass: 'btn btn-info',
            buttonsStyling: false
          }).catch(swal.noop);
        }
      );
  }

  deleteValidation(validationData: validation) {
    return this.apollo.mutate<any>({
      mutation: gql`
        mutation DeleteMutation($where: problem_validations_bool_exp!) {
          delete_problem_validations(where: $where) {
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
            _eq: validationData.user_id
          },
          problem_id: {
            _eq: validationData.problem_id
          }
        }
      }
    });
  }

  submitSolutionValidationToDB(validationData) {
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
      .pipe(take(1))
      .subscribe(
        data => {},
        err => {
          console.error(JSON.stringify(err));

          swal({
            title: 'Error',
            text: 'Try Again',
            type: 'error',
            confirmButtonClass: 'btn btn-info',
            buttonsStyling: false
          }).catch(swal.noop);
        }
      );
  }

  deleteSolutionValidation(validationData) {
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
          user_id: {
            _eq: validationData.user_id
          },
          solution_id: {
            _eq: validationData.solution_id
          }
        }
      }
    });
  }
}
