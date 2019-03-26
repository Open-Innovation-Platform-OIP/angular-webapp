import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import * as Query from "./queries";
import { Timestamp } from "aws-sdk/clients/workspaces";
import { stringType } from "aws-sdk/clients/iam";
import { String } from "aws-sdk/clients/sns";

export interface enrichment {
  description: String;
  location: String;
  organization: String;
  resources_needed: String;
  image_urls: any[];
  video_urls: any[];
  impact: String;
  min_population: Number;
  extent: String;
  beneficiary_attributes: String;
  id?: Number;
  problem_id?: Number;
  solution_id?: Number;
  created_by?: Number;
  created_at?: Timestamp;
  edited_at?: Timestamp;
  is_deleted?: Boolean;
  voted_by?: any[];
}

@Injectable({
  providedIn: "root"
})
export class EnrichmentService {
  constructor(private apollo: Apollo) {}

  submitEnrichmentToDB(enrichmentData: enrichment) {
    console.log(enrichmentData, "testing enrich on update");
    console.log("test");
    this.apollo
      .mutate({
        mutation: gql`
          mutation upsert_enrichments(
            $enrichments: [enrichments_insert_input!]!
          ) {
            insert_enrichments(
              objects: $enrichments
              on_conflict: {
                constraint: enrichments_pkey
                update_columns: [
                  description
                  location
                  organization
                  resources_needed
                  image_urls
                  video_urls
                  impact
                  min_population
                  extent
                  beneficiary_attributes
                  featured_url
                  featured_type
                  embed_urls
                ]
              }
            ) {
              affected_rows
              returning {
                id
              }
            }
          }
        `,
        variables: {
          enrichments: [enrichmentData]
        }
      })
      .subscribe(
        data => {
          console.log(data);
          // location.reload();
        },
        err => {
          console.log(err, "error");
          console.error(JSON.stringify(err));
        }
      );
  }

  deleteEnrichment(id: number) {
    console.log(id, "ID");
    this.apollo
      .mutate<any>({
        mutation: gql`
          mutation DeleteMutation($where: enrichments_bool_exp!) {
            delete_enrichments(where: $where) {
              affected_rows
              returning {
                problem_id
              }
            }
          }
        `,
        variables: {
          where: {
            id: {
              _eq: id
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

  voteEnrichment(enrichmentData: any) {
    console.log("enrichment voted by object", enrichmentData);
    // console.log("test for vote enrich", id, enrichmentData);
    this.apollo
      .mutate<any>({
        mutation: gql`
          mutation updateMutation(
            $where: enrichments_bool_exp!
            $set: enrichments_set_input!
          ) {
            update_enrichments(where: $where, _set: $set) {
              affected_rows
              returning {
                id
              }
            }
          }
        `,
        variables: {
          where: {
            id: {
              _eq: enrichmentData.id
            }
          },
          set: {
            voted_by: enrichmentData.voted_by
          }
        }
      })
      .subscribe(
        ({ data }) => {
          console.log(data, "return form db");
          // location.reload();

          return;
        },
        error => {
          console.log("Could delete due to " + error);
        }
      );
  }
}
