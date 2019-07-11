import { Component, OnInit, OnDestroy, OnChanges } from "@angular/core";
import * as Query from "../../services/queries";
import { Apollo, QueryRef } from "apollo-angular";
import gql from "graphql-tag";
import { Observable, Subscription } from "rxjs";
import { P } from "@angular/cdk/keycodes";
import { AuthService } from "../../services/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { TagsService } from "../../services/tags.service";
import { take } from "rxjs/operators";
import { FilterService } from "../../services/filter.service";

@Component({
  selector: "app-problems-view",
  templateUrl: "./problems-view.component.html",
  styleUrls: ["./problems-view.component.css"]
})
export class ProblemsViewComponent implements OnInit, OnDestroy, OnChanges {
  userProblems = [];
  problems = [];
  userProblemViewQuery: QueryRef<any>;
  userProblemViewSubscription: Subscription;
  problemViewQuery: QueryRef<any>;
  problemViewSubscription: Subscription;
  constructor(
    private apollo: Apollo,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private tagsService: TagsService,
    private filterService: FilterService
  ) {
    // this.tagsService.getTagsFromDB();
  }
  cities: any = [1, 2, 3];
  selectedSectors: any = [];
  sectors: any = {};
  objectValues = Object.values;
  sectorFilter: any = {};
  in_query: string = ``;

  ngOnInit() {
    this.tagsService.getTagsFromDB();

    console.log(this.tagsService.allTags, "tag");
    this.sectors = this.tagsService.allTags;

    this.activatedRoute.queryParams.subscribe(params => {
      // let test = this.tagsService.allTagsArray;
      // if (!Object.keys(params).length) {
      //   this.in_query = `_nin:[0]`;
      // } else {
      //   this.tagsService.sectorFilterArray = Object.values(params).map(String);
      //   console.log(this.tagsService.sectorFilterArray, "tag array");
      //   this.in_query = `_in:[${this.tagsService.sectorFilterArray}]`;
      // }
      this.selectedSectors = this.filterService.filterSector(params);
      // this.filterService.filterSector(params);

      // console.log(test.length, "tags array");
      // console.log("params", params);
      // console.log("working", this.tagsService.allTags); // Print the parameter to the console.
      this.problemViewQuery = this.apollo.watchQuery<any>({
        query: gql`
          query PostsGetQuery {
            problems_tags(
              where: {
                tag_id: { ${this.filterService.sector_filter_query} }
                problem: { is_draft: { _eq: false } }
              }
              order_by: { problem: { updated_at: desc } }
            ) {
              problem {
                id
                title
                description
                location
                resources_needed
                image_urls
                modified_at
                updated_at

                featured_url

                is_deleted
                problem_voters {
                  problem_id
                  user_id
                }
                problem_watchers {
                  problem_id
                  user_id
                }
                problem_validations {
                  validated_by
                  comment
                  agree
                  created_at
                  files
                  validated_by
                  edited_at
                  is_deleted
                  problem_id
                }
                problem_collaborators {
                  user_id
                  problem_id
                  edited_at
                }
                discussionssByproblemId {
                  id
                  problem_id
                  modified_at
                }
                enrichmentsByproblemId {
                  id
                  problem_id
                  edited_at
                }
              }
            }
          }
        `,
        pollInterval: 500,
        fetchPolicy: "network-only"
      });

      this.problemViewSubscription = this.problemViewQuery.valueChanges.subscribe(
        result => {
          if (result.data.problems_tags.length > 0) {
            this.problems = result.data.problems_tags;
          }
          console.log("PROBLEMS", result);
        },
        error => {
          console.error(JSON.stringify(error));
        }
      );
    });

    // console.log(Number(this.auth.currentUserValue.id), "id");
    // this.userProblemViewQuery = this.apollo.watchQuery<any>({
    //   query: gql`
    //       query PostsGetQuery {
    //         problems (

    //           where:{ _and: [
    //             { created_by: {_eq: ${Number(this.auth.currentUserValue.id)}}},
    //             { is_draft: {_eq: false}}
    //           ]

    //           }
    //           order_by: {updated_at: desc}

    //         ) {
    //           id
    //           title
    //           description
    //           location
    //           resources_needed
    //           image_urls
    //           modified_at
    //           updated_at

    //           featured_url

    //           is_deleted
    //           problem_voters{
    //             problem_id
    //             user_id
    //           }
    //           problem_watchers{
    //             problem_id
    //             user_id

    //           }
    //           problem_validations {
    //             validated_by
    //             comment
    //             agree
    //             created_at
    //             files
    //             validated_by
    //             edited_at
    //             is_deleted
    //             problem_id
    //           }
    //           problem_collaborators {
    //             user_id
    //             problem_id
    //             edited_at
    //           }
    //           discussionssByproblemId {
    //             id
    //             problem_id
    //             modified_at
    //           }
    //           enrichmentsByproblemId {
    //             id
    //             problem_id
    //             edited_at
    //           }
    //         }
    //       }
    //     `,
    //   pollInterval: 500,
    //   fetchPolicy: "network-only"
    // });

    // this.userProblemViewSubscription = this.userProblemViewQuery.valueChanges.subscribe(
    //   result => {
    //     if (result.data.problems.length > 0) {
    //       this.userProblems = result.data.problems;
    //       // console.log(this.userProblems, "problem card data");
    //     }
    //     // console.log("PROBLEMS", this.problems);
    //   },
    //   error => {
    //     console.error(JSON.stringify(error));
    //   }
    // );

    // console.log(Number(this.auth.currentUserValue.id), "id");
  }

  // test() {
  //   console.log(this.currentCity, "current city");
  // }

  ngOnChanges() {
    // console.log(this.tagsService.allTags, "tags");
  }
  selectSector() {
    // let sectorFilterObject = {};

    this.selectedSectors.map(sectorName => {
      this.sectorFilter[sectorName] = this.tagsService.allTags[sectorName].id;
      // this.tagsService.sectorFilterArray.push()
    });

    this.router.navigate(["/problems"], {
      queryParams: this.sectorFilter
    });
  }

  ngOnDestroy() {
    // this.userProblemViewQuery.stopPolling();
    // this.userProblemViewSubscription.unsubscribe();
    this.problemViewQuery.stopPolling();
    this.problemViewSubscription.unsubscribe();
  }
}
