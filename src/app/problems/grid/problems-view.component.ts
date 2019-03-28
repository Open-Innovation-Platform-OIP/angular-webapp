import { Component, OnInit, OnDestroy } from "@angular/core";
import * as Query from "../../services/queries";
import { Apollo, QueryRef } from "apollo-angular";
import gql from "graphql-tag";
import { Observable, Subscription } from "rxjs";
import { P } from "@angular/cdk/keycodes";
import { AuthService } from "../../services/auth.service";
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
  constructor(private apollo: Apollo, private auth: AuthService) {}

  ngOnInit() {
    console.log(Number(this.auth.currentUserValue.id), "id");
    this.userProblemViewQuery = this.apollo.watchQuery<any>({
      query: gql`
          query PostsGetQuery {
            problems (
              where: {created_by: {_eq: ${Number(
                this.auth.currentUserValue.id
              )}},
              }
              order_by: {modified_at: desc}
              
            ) {
              id
              title
              description
              location
              resources_needed
              image_urls
              modified_at
              voted_by
              featured_url
              watched_by
              is_deleted
              problem_validations {
                comment
                agree
                created_at
                files
                validated_by
                edited_at
                is_deleted
                problem_id
              }
            }
          }
        `,
      pollInterval: 500,
      fetchPolicy: "network-only"
    });

    this.userProblemViewSubscription = this.userProblemViewQuery.valueChanges.subscribe(
      result => {
        if (result.data.problems.length > 0) {
          this.userProblems = result.data.problems;
        }
        // console.log("PROBLEMS", this.problems);
      }
    );

    console.log(Number(this.auth.currentUserValue.id), "id");
    this.problemViewQuery = this.apollo.watchQuery<any>({
      query: gql`
          query PostsGetQuery {
            problems (
              where: {created_by: {_neq: ${Number(
                this.auth.currentUserValue.id
              )}}}
              order_by: {modified_at: desc}
              
            ) {
              id
              title
              description
              location
              resources_needed
              image_urls
              modified_at
              voted_by
              featured_url
              watched_by
              is_deleted
              problem_validations {
                comment
                agree
                created_at
                files
                validated_by
                edited_at
                is_deleted
                problem_id
              }
            }
          }
        `,
      pollInterval: 500,
      fetchPolicy: "network-only"
    });

    this.problemViewSubscription = this.problemViewQuery.valueChanges.subscribe(
      result => {
        if (result.data.problems.length > 0) {
          this.problems = result.data.problems;
        }
        // console.log("PROBLEMS", this.problems);
      }
    );
  }

  ngOnDestroy() {
    this.userProblemViewQuery.stopPolling();
    this.userProblemViewSubscription.unsubscribe();
    this.problemViewQuery.stopPolling();
    this.problemViewSubscription.unsubscribe();
  }
}
