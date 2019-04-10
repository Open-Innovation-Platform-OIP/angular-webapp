import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { EnrichmentService } from "../services/enrichment.service";
import { map, startWith } from "rxjs/operators";
import { first } from "rxjs/operators";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";

@Component({
  selector: "app-enrichment-form",
  templateUrl: "./enrichment-form.component.html",
  styleUrls: ["./enrichment-form.component.css"]
})
export class EnrichmentFormComponent implements OnInit {
  private problemId: Number;
  private problemData: any;
  private enrichmentData: any = {
    created_by: "",

    description: "",
    location: [],
    organization: "",
    resources_needed: "",
    image_urls: [],
    video_urls: [],
    impact: "",
    min_population: 0,
    max_population: "",
    extent: "",
    beneficiary_attributes: "",
    voted_by: "{}",
    featured_url: "",
    embed_urls: [],
    featured_type: "",
    attachments: []
  };

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private enrichmentService: EnrichmentService,
    private apollo: Apollo
  ) { }

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
                        location
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
                        
                        usersBycreatedBy {
                          id
                          name
                        }
                        problem_tags{
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
        .valueChanges.subscribe(
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
                            location
                            resources_needed
                            image_urls
                            video_urls
                            attachments
                            impact
                            extent
                            min_population
                            max_population
                            beneficiary_attributes
                            organization
                            featured_url
                            featured_type
                            embed_urls
                            voted_by
                            problemsByproblemId{
                              id
                              title
                              created_by
                              description
                              location
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
                             
                              usersBycreatedBy {
                                id
                                name
                              }
                              problem_tags{
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
          .valueChanges.subscribe(
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

  onEnrichmentSubmit(enrichmentData) {
    if (enrichmentData.__typename) {
      delete enrichmentData.__typename;
      // delete enrichmentData.usersBycreatedBy;
    }
    enrichmentData.created_by = Number(this.auth.currentUserValue.id);

    enrichmentData.problem_id = this.problemId;

    if (typeof enrichmentData.voted_by === "string") {
      // this.submitted.emit(this.enrichmentData);
      this.enrichmentService.submitEnrichmentToDB(enrichmentData);
    } else {
      enrichmentData.voted_by = enrichmentData.voted_by = JSON.stringify(
        enrichmentData.voted_by
      )
        .replace("[", "{")
        .replace("]", "}");

      this.enrichmentService.submitEnrichmentToDB(enrichmentData);
    }
  }
}
