import { Component, OnInit } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Router, ActivatedRoute } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { SearchService } from "../services/search.service";

@Component({
  selector: "app-landing-page",
  templateUrl: "./landing-page.component.html",
  styleUrls: ["./landing-page.component.css"]
})
export class LandingPageComponent implements OnInit {
  landingPageSearchResults = [];
  searchInput: any;
  problems: any;
  numberToBeShown: Number;

  constructor(
    private apollo: Apollo,
    private route: ActivatedRoute,
    private router: Router,
    private ngxService: NgxUiLoaderService,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.numberToBeShown = 4;
    this.apollo
      .watchQuery<any>({
        query: gql`
          query PostsGetQuery {
            problems(
              where: { is_draft: { _eq: false } }

              order_by: { updated_at: desc }
            ) {
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
        `,

        fetchPolicy: "network-only"
      })
      .valueChanges.subscribe(
        result => {
          if (result.data.problems.length > 0) {
            this.problems = result.data.problems;
            // console.log(this.problems, "problem card data", result.data.problems);
          }
          // console.log("PROBLEMS", this.problems);
        },
        error => {
          console.error(JSON.stringify(error));
        }
      );
  }

  showAll() {
    this.ngxService.start();

    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop();
    }, 2000);

    this.numberToBeShown = Number.MAX_SAFE_INTEGER;
  }

  landingPageSearch(searchInput: string) {
    // this.numberToBeShown = 8;
    if (this.searchInput.length < 2) {
      this.numberToBeShown = 4;
    }
    if (searchInput.length >= 3) {
      this.numberToBeShown = 8;

      this.landingPageSearchResults = [];

      this.searchService.problemSearch(searchInput).subscribe(
        value => {
          this.landingPageSearchResults = value.data.search_problems_multiword;
        },
        error => {
          // console.log(error);
          console.error(JSON.stringify(error));
        }
      );
    } else {
      this.landingPageSearchResults = [];
      // this.numberToBeShown = 8;
    }
  }
}
