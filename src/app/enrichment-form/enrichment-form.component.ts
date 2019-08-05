import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { EnrichmentService } from "../services/enrichment.service";
import { map, startWith } from "rxjs/operators";
import { first } from "rxjs/operators";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { take } from "rxjs/operators";
import { GeocoderService } from "../services/geocoder.service";
import { Subscription } from "rxjs";
import swal from "sweetalert2";
// import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-enrichment-form",
  templateUrl: "./enrichment-form.component.html",
  styleUrls: ["./enrichment-form.component.css"]
})
export class EnrichmentFormComponent implements OnInit, OnDestroy {
  private problemId: Number;
  private problemData: any;
  enrichmentLocations: any = [];
  private enrichmentData: any = {
    created_by: "",

    description: "",

    organization: "",
    resources_needed: "",
    image_urls: [],
    video_urls: [],
    impact: "",
    min_population: 0,
    max_population: "",
    extent: "",
    beneficiary_attributes: "",

    featured_url: "",
    embed_urls: [],
    featured_type: "",
    attachments: []
  };
  submitEnrichmentSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private enrichmentService: EnrichmentService,
    private apollo: Apollo,
    private geoService: GeocoderService,
    private router: Router
  ) {}

  ngOnInit() {
    // console.log(this.route.snapshot.paramMap.get("problemId"), "problemid");
    this.problemId = Number(this.route.snapshot.paramMap.get("problemId"));

    if (this.problemId) {
      this.apollo
        .watchQuery<any>({
          query: gql`
                    {
                        problems(where: { id: { _eq: ${this.problemId} } }) {
                        
                        
                        id
                        title
                        created_by
                        description
                        
                        resources_needed
                        problem_locations{
                          location{
                            id
                            location_name
                            location
                            lat
                            long
                          }
                        }
                        image_urls
                        video_urls
                        impact
                        extent
                        min_population
                        max_population
                        beneficiary_attributes
                        organization
                        featured_url
                        featured_type
                        embed_urls
                        
                        user {
                          id
                          name
                        }
                        problems_tags{
                          tag {
                              id
                              name
                          }
                      }

                        
                       
                        }
                    }
                    `,
          fetchPolicy: "network-only"
          // pollInterval: 500,
        })
        .valueChanges.pipe(take(1))
        .subscribe(
          result => {
            console.log(result, "result");
            if (
              result.data.problems.length >= 1 &&
              result.data.problems[0].id
            ) {
              // this.enrichmentData = result.data.enrichments[0];
              // this.enrichmentData["id"] = result.data.enrichments[0].id;
              // Object.keys(this.enrichmentData).map(key => {
              //   // console.log(key, result.data.problems[0][key]);
              //   if (result.data.enrichments[0][key]) {
              //     this.enrichmentData[key] = result.data.enrichments[0][key];
              //   }
              // });

              this.problemData = result.data.problems[0];

              console.log(this.problemData, "problemData");
            }
          },
          err => {
            console.log("error", err);
            console.error(JSON.stringify(err));
          }
        );
    }

    this.route.params.pipe(first()).subscribe(params => {
      if (params.id) {
        console.log(params.id, "params id in enrichment");
        this.apollo
          .watchQuery<any>({
            query: gql`
                        {
                            enrichments(where: { id: { _eq: ${params.id} } }) {
                            
                            
                            id
                            
                            created_by
                            description
                            
                            resources_needed
                            image_urls
                            video_urls
                            attachments
                            impact
                            extent
                            attachments
                            min_population
                            max_population
                            beneficiary_attributes
                            organization
                            featured_url
                            featured_type
                            embed_urls

                            enrichment_locations{
                              location{
                                id
                                location_name
                                location
                                lat
                                long
                              }
                            }
                            
                            problem{
                              id
                              title
                              created_by
                              description
                              
                              problem_locations{
                                location{
                                  id
                                location_name
                                location
                                lat
                                long
                                }
                              }
                              
                              resources_needed
                              image_urls
                              video_urls
                              impact
                              extent
                              min_population
                              max_population
                              beneficiary_attributes
                              organization
                              featured_url
                              featured_type
                              embed_urls
                             
                              user {
                                id
                                name
                              }
                              problems_tags{
                                tag {
                                    id
                                    name
                                }
                            }

                            }
                           

                            
                           
                            }
                        }
                        `,
            fetchPolicy: "network-only"
            // pollInterval: 500
          })
          .valueChanges.pipe(take(1))
          .subscribe(
            result => {
              console.log(result, "result");
              if (
                result.data.enrichments.length >= 1 &&
                result.data.enrichments[0].id
              ) {
                // this.enrichmentData = result.data.enrichments[0];
                this.enrichmentData["id"] = result.data.enrichments[0].id;
                Object.keys(this.enrichmentData).map(key => {
                  // console.log(key, result.data.problems[0][key]);
                  if (result.data.enrichments[0][key]) {
                    this.enrichmentData[key] = result.data.enrichments[0][key];
                  }
                });

                if (result.data.enrichments[0].enrichment_locations) {
                  this.enrichmentLocations = result.data.enrichments[0].enrichment_locations.map(
                    locations => {
                      if (locations.location.__typename)
                        delete locations.location.__typename;
                      return locations.location;
                    }
                  );
                }

                this.problemData =
                  result.data.enrichments[0].problemsByproblemId;
                console.log(this.problemData, "on edit problme data");
              }
            },
            err => {
              console.log("error", err);
              console.error(JSON.stringify(err));
            }
          );
      }
    });
  }

  addLocation(locations) {
    this.enrichmentLocations = locations;
    console.log(this.geoService.allLocations, "all locations");
  }

  removeLocation(removedLocation) {
    console.log(this.enrichmentLocations, "removed location");

    this.enrichmentLocations = this.enrichmentLocations.filter(location => {
      if (location.location_name !== removedLocation.location_name) {
        return location;
      }
    });

    if (
      this.geoService.allLocations[removedLocation.location_name] &&
      this.enrichmentData["id"]
    ) {
      this.geoService.removeLocationRelation(
        removedLocation.id,
        this.enrichmentData["id"],
        "enrichments"
      );
    } else if (removedLocation.id) {
      this.geoService.removeLocationRelation(
        removedLocation.id,
        this.enrichmentData["id"],
        "enrichments"
      );
    }
  }

  onEnrichmentSubmit(enrichmentData) {
    if (enrichmentData.__typename) {
      delete enrichmentData.__typename;
      // delete enrichmentData.user;
    }
    enrichmentData.created_by = Number(this.auth.currentUserValue.id);

    enrichmentData.problem_id = this.problemId;

    // if (typeof enrichmentData.voted_by === "string") {
    //   // this.submitted.emit(this.enrichmentData);
    //   this.enrichmentService.submitEnrichmentToDB(enrichmentData);
    // } else {
    //   enrichmentData.voted_by = enrichmentData.voted_by = JSON.stringify(
    //     enrichmentData.voted_by
    //   )
    //     .replace("[", "{")
    //     .replace("]", "}");

    // this.enrichmentService.submitEnrichmentToDB(enrichmentData);

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
                id
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
          console.log(data, "enrichment submit data");
          let enrichmentId = data.data.insert_enrichments.returning[0].id;
          // this.enrichmentData
          const enrichment_locations = new Set();
          this.enrichmentLocations.map(location => {
            if (
              this.geoService.allLocations[location.location_name] &&
              this.geoService.allLocations[location.location_name].id
            ) {
              enrichment_locations.add({
                location_id: this.geoService.allLocations[
                  location.location_name
                ].id,
                enrichment_id: enrichmentId
              });
            }
          });

          if (enrichment_locations.size > 0) {
            this.geoService.addRelationToLocations(
              enrichmentId,
              enrichment_locations,
              "enrichments"
            );
          }

          if (this.enrichmentLocations) {
            this.geoService.addLocationsInDB(
              this.enrichmentLocations,
              "enrichments",
              enrichmentId
            );
          }

          console.log(data, "enrichment added");
          swal({
            type: "success",
            title: "Thank you for enriching!",
            timer: 4000,
            showConfirmButton: false
          }).catch(swal.noop);
          // location.reload();
          this.router.navigate(
            ["problems", data.data.insert_enrichments.returning[0].problem_id],
            { queryParamsHandling: "preserve" }
          );
          this.submitEnrichmentSub.unsubscribe();
        },
        err => {
          console.log(err, "error");
          console.error(JSON.stringify(err));
          this.submitEnrichmentSub.unsubscribe();

          swal({
            title: "Error",
            text: "Try Again",
            type: "error",
            confirmButtonClass: "btn btn-info",
            buttonsStyling: false
          }).catch(swal.noop);
        }
      );
    // }
  }

  ngOnDestroy() {}
}
