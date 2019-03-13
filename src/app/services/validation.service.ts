import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";

export interface validation {
  comment: String;
  agree: boolean;
  files: any[];
}

@Injectable({
  providedIn: "root"
})
export class ValidationService {
  constructor(private apollo: Apollo) {}

  submitValidationToDB(validationData) {
    console.log(validationData, "validation data");
    if (validationData.__typename) {
      delete validationData.__typename;
    }

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
          location.reload();
        },
        err => {
          console.log(err, "error");
        }
      );
  }

  deleteValidation(validationData) {
    console.log(validationData, "delete validation");
    // console.log(id, "ID");
    this.apollo
      .mutate<any>({
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
