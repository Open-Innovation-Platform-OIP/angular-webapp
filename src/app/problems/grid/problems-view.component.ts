import { Component, OnInit, OnDestroy } from "@angular/core";

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
export class ProblemsViewComponent implements OnInit, OnDestroy {
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

  selectedSectors: any = [];

  ngOnInit() {
    this.tagsService.getTagsFromDB();

    console.log(this.tagsService.allTags, "tag");

    this.activatedRoute.queryParams.subscribe(params => {
      this.selectedSectors = this.filterService.filterSector(params);

      console.log(this.filterService.sector_filter_query, "tag");

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
                
                resources_needed
                image_urls
                edited_at
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
                problem_locations{
                  location{
                    id
                    location_name
                    lat
                    long
                  }
                }
                problem_validations {
                  user_id
                  comment
                  agree
                  created_at
                  files
                  user_id
                  edited_at
                  is_deleted
                  problem_id
                }
                problem_collaborators {
                  user_id
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
  }

  ngOnDestroy() {
    // this.userProblemViewQuery.stopPolling();
    // this.userProblemViewSubscription.unsubscribe();
    this.problemViewQuery.stopPolling();
    this.problemViewSubscription.unsubscribe();
  }
}
