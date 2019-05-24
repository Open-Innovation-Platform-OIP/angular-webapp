import { Component, OnInit, OnDestroy } from "@angular/core";
import * as Query from "../../services/queries";
import { Apollo, QueryRef } from "apollo-angular";
import gql from "graphql-tag";
import { Observable, Subscription } from "rxjs";
import { P } from "@angular/cdk/keycodes";
import { AuthService } from "../../services/auth.service";

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

  constructor(private apollo: Apollo, private auth: AuthService) {}

  ngOnInit() {
    this.solutionViewQuery = this.apollo.watchQuery<any>({
      query: gql`
        query PostsGetQuery {
          solutions(where: { is_draft: { _eq: false } }) {
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
      `,
      pollInterval: 500,
      fetchPolicy: "network-only"
    });
    this.solutionViewSubscription = this.solutionViewQuery.valueChanges.subscribe(
      result => {
        if (result.data.solutions.length > 0) {
          this.solutions = result.data.solutions;
          // console.log(this.problems, "problem card data", result.data.problems);
        }
        // console.log("PROBLEMS", this.problems);
      },
      error => {
        console.error(JSON.stringify(error));
      }
    );
  }

  ngOnDestroy() {
    // this.userProblemViewQuery.stopPolling();
    // this.userProblemViewSubscription.unsubscribe();
    this.solutionViewQuery.stopPolling();
    this.solutionViewSubscription.unsubscribe();
  }
}
