import { Component, OnInit } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Router, ActivatedRoute } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";

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
    private ngxService: NgxUiLoaderService
  ) {}

  ngOnInit() {
    this.numberToBeShown = 8;
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
    if (searchInput.length >= 3) {
      this.landingPageSearchResults = [];

      this.apollo
        .watchQuery<any>({
          query: gql`query {
            search_problems(args: {search: "${searchInput}"},where: { is_draft: { _eq: false } }) {
              id
              title
              description
              modified_at
              updated_at
              image_urls
              featured_url
             
              problem_voters{
                problem_id
                user_id
              }
              problem_watchers{
                problem_id
                user_id

              }
              problem_validations {
                comment
                agree
                created_at
                files
                validated_by
                edited_at
                is_deleted
        
                problem_id
                user {
                  id
                  name
                } 
                
              }
              }
              , search_users(args:{search:"${searchInput}"}) {





              id
              name
              email
              photo_url
              organization
              location
              user_tags{
                tag {
                    id
                    name
                }
            }
            problemsByUser(where: { is_draft: { _eq: false } }){
              id

            }
            user_collaborators{
              intent
            }
            user_validations{
              comment
            }
            enrichmentssBycreatedBy(where: { is_deleted: { _eq: false } }){
              id
            }
             
            }
            
            }`
          // pollInterval: 500
        })
        .valueChanges.subscribe(value => {
          this.landingPageSearchResults = value.data.search_problems;
        });
    } else {
      this.landingPageSearchResults = [];
      this.numberToBeShown = 8;
    }
  }
}
