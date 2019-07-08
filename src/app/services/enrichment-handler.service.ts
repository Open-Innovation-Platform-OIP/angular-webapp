import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import * as Query from "./queries";
import { Subscription } from "rxjs";
@Injectable({
  providedIn: "root"
})
export class EnrichmentHandlerService {
  deleteEnrichmentSub: Subscription;
  constructor(private apollo: Apollo) {}

  addEnrichment(enrichmentData: any) {
    console.log(enrichmentData, "enrich data in service");
    return this.apollo.mutate<any>({
      mutation: Query.AddEnrichment,
      variables: {
        objects: [enrichmentData]
      }
    });
  }

  deleteEnrichment(id: number) {
    console.log(id, "ID");
    this.deleteEnrichmentSub = this.apollo
      .mutate<any>({
        mutation: Query.DeleteEnrichmentMutation,
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
          this.deleteEnrichmentSub.unsubscribe();

          location.reload();
          // this.router.navigateByUrl("/problems");

          return;
        },
        error => {
          this.deleteEnrichmentSub.unsubscribe();

          console.log("Could delete due to " + error);
        }
      );
  }

  updateEnrichment(enrichmentId: number, updatedEnrichmentData: any) {
    console.log(enrichmentId, "enrichment id");
    console.log(updatedEnrichmentData, "updated enrichment data 2");
    return this.apollo.mutate<any>({
      mutation: Query.UpdateEnrichment,
      variables: {
        where: {
          id: {
            _eq: enrichmentId
          }
        },
        set: {
          description: updatedEnrichmentData.description,
          resources_needed: updatedEnrichmentData.resources_needed,
          location: updatedEnrichmentData.location,
          image_urls: updatedEnrichmentData.image_urls,
          impact: updatedEnrichmentData.impact,
          extent: updatedEnrichmentData.extent,
          min_population: updatedEnrichmentData.min_population,

          beneficiary_attributes: updatedEnrichmentData.beneficiary_attributes,
          organization: updatedEnrichmentData.organization,
          video_urls: updatedEnrichmentData.video_urls
        }
      }
    });
  }

  storeEnrichmentVotedBy(enrichmentData: any) {
    console.log("enrichment voted by object", enrichmentData);
    // console.log("test for vote enrich", id, enrichmentData);
    this.apollo
      .mutate<any>({
        mutation: Query.UpdateEnrichment,
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
