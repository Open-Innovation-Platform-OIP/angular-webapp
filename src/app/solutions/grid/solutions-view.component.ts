import { Component, OnInit, OnDestroy } from "@angular/core";
import * as Query from "../../services/queries";
import { Apollo, QueryRef } from "apollo-angular";
import gql from "graphql-tag";
import { Observable, Subscription } from "rxjs";
import { P } from "@angular/cdk/keycodes";
import { AuthService } from "../../services/auth.service";
import { Router, ActivatedRoute } from "@angular/router";
import { TagsService } from "../../services/tags.service";
import { FilterService } from "../../services/filter.service";

@Component({
  selector: "app-solutions-view",
  templateUrl: "./solutions-view.component.html",
  styleUrls: ["./solutions-view.component.css"]
})
export class SolutionsViewComponent implements OnInit {
  userSolutions = [];
  solutions = [];
  userSolutionViewQuery: QueryRef<any>;
  userSolutionViewSubscription: Subscription;
  solutionViewQuery: QueryRef<any>;
  solutionViewSubscription: Subscription;

  selectedSectors: any = [];

  constructor(
    private apollo: Apollo,
    private auth: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tagsService: TagsService,
    private filterService: FilterService
  ) {}

  ngOnInit() {
    this.tagsService.getTagsFromDB();

    this.activatedRoute.queryParams.subscribe(params => {
      this.selectedSectors = this.filterService.filterSector(params);

      this.solutionViewQuery = this.apollo.watchQuery<any>({
        query: gql`
          query PostsGetQuery {
            solutions_tags(
              where: {
                tag_id: { ${this.filterService.sector_filter_query} }
                solution: { is_draft: { _eq: false } }
              }
              order_by: { solution: { updated_at: desc } }
            ) {
              solution {
              id
              title
              description
              technology
              impact
              website_url
              deployment
              budget
              image_urls
              modified_at
              updated_at
              featured_url
              is_deleted
              solution_watchers {
                user_id
              }
              solution_voters {
                user_id
              }

              solution_validations(order_by: { edited_at: desc }) {
                validated_by
              }
            }
            }
          }
        `,
        pollInterval: 500,
        fetchPolicy: "network-only"
      });
      this.solutionViewSubscription = this.solutionViewQuery.valueChanges.subscribe(
        result => {
          if (result.data.solutions_tags.length > 0) {
            this.solutions = result.data.solutions_tags;
          }
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
    this.solutionViewQuery.stopPolling();
    this.solutionViewSubscription.unsubscribe();
  }
}
