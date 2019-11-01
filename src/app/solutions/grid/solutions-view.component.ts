import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit
} from "@angular/core";

import { Apollo, QueryRef } from "apollo-angular";
import gql from "graphql-tag";
import { Subscription } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { Router, ActivatedRoute } from "@angular/router";
import { TagsService } from "../../services/tags.service";
import { FilterService } from "../../services/filter.service";
import { FocusMonitor } from "@angular/cdk/a11y";

@Component({
  selector: "app-solutions-view",
  templateUrl: "./solutions-view.component.html",
  styleUrls: ["./solutions-view.component.css"]
})
export class SolutionsViewComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("solutionWorthSharing") solutionWorthSharing: ElementRef;

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
    private filterService: FilterService,
    private focusMonitor: FocusMonitor
  ) {}

  ngOnInit() {
    this.tagsService.getTagsFromDB();

    this.activatedRoute.queryParams.subscribe(params => {
      this.filterService.selectedSectors = this.filterService.filterSector(
        params
      );
      this.filterService.selectedLocation = this.filterService.filterLocation(
        params
      );

      this.solutionViewQuery = this.apollo.watchQuery<any>({
        query: gql`
          query PostsGetQuery${this.filterService.location_filter_header} {
           
            solutions(
              where: {
                _and:[{
                solutions_tags:{tag_id:{${this.filterService.sector_filter_query}
                }}},${this.filterService.solution_location_filter_query}
              ],
               
                is_draft: { _eq: false } 
              }
              order_by: { updated_at: desc }
            ){
              id
              title
              description
              technology
              impact
              website_url
              deployment
              image_urls
              edited_at
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
                user_id
              }

              problems_solutions{
                problem{
                  id
                      title
                      description
                      
                      resources_needed
                      image_urls
                      edited_at
                      updated_at
          
                      featured_url
          
                      is_deleted
          
                      problem_locations{
                        location{
                          id
                          location_name
                          location
                           lat
                           long
                        }
                      }
                    }
                  }
            }
            }
        `,
        variables: this.filterService.queryVariable,
        pollInterval: 500,
        fetchPolicy: "network-only"
      });
      this.solutionViewSubscription = this.solutionViewQuery.valueChanges.subscribe(
        result => {
          console.log(result, "solution view result");
          if (result.data.solutions.length > 0) {
            this.solutions = result.data.solutions;
          } else {
            this.solutions = [];
          }
        },
        error => {
          console.error(JSON.stringify(error));
        }
      );
    });
  }

  ngAfterViewInit() {
    // delay needed because *ngIf makes viewchild undefined
    setTimeout(() => {
      this.focusMonitor.focusVia(this.solutionWorthSharing, "program");
    }, 1000);
  }

  ngOnDestroy() {
    this.solutionViewQuery.stopPolling();
    this.solutionViewSubscription.unsubscribe();
  }
}
