import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

import { Timestamp } from 'aws-sdk/clients/workspaces';
import { stringType } from 'aws-sdk/clients/iam';
import { String } from 'aws-sdk/clients/sns';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import swal from 'sweetalert2';
declare var $: any;

export interface enrichment {
  description: String;
  location: String;
  organization: String;
  resources_needed: String;
  image_urls: any[];
  video_urls: any[];
  impact: String;
  min_population: Number;
  max_population: Number;
  extent: String;
  beneficiary_attributes: String;
  id?: Number;
  problem_id?: Number;
  solution_id?: Number;
  user_id?: Number;
  created_at?: Timestamp;
  edited_at?: Timestamp;
  is_deleted?: Boolean;
  voted_by?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class EnrichmentService {
  submitEnrichmentSub: Subscription;
  constructor(private apollo: Apollo, private router: Router) {}

  submitEnrichmentToDB(enrichmentData: enrichment) {
    this.submitEnrichmentSub = this.apollo
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
                  max_population
                  extent
                  beneficiary_attributes
                  featured_url
                  featured_type
                  embed_urls
                  attachments
                ]
              }
            ) {
              affected_rows
              returning {
                problem_id
                solution_id
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
          swal({
            type: 'success',
            title: 'Thank you for enriching!',
            timer: 4000,
            showConfirmButton: false
          }).catch(swal.noop);

          this.router.navigate(
            ['problems', data.data.insert_enrichments.returning[0].problem_id],
            { queryParamsHandling: 'preserve' }
          );
          this.submitEnrichmentSub.unsubscribe();
        },
        err => {
          console.error(JSON.stringify(err));
          this.submitEnrichmentSub.unsubscribe();

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

  deleteEnrichment(id: number) {
    return this.apollo.mutate<any>({
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
            _eq: id
          }
        },
        set: {
          is_deleted: true
        }
      }
    });
  }

  voteEnrichment(enrichmentData: any) {
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
          return;
        },
        error => {
          console.error(error);
        }
      );
  }
}
