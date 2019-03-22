import { Component, OnInit } from "@angular/core";
import * as Query from "../../services/queries";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Observable } from "rxjs";
import { P } from "@angular/cdk/keycodes";

@Component({
  selector: "app-problems-view",
  templateUrl: "./problems-view.component.html",
  styleUrls: ["./problems-view.component.css"]
})
export class ProblemsViewComponent implements OnInit {
  problems = [];
  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.apollo
      .watchQuery<any>({
        query: gql`
          query PostsGetQuery {
            problems {
              id
              title
              description
              location
              resources_needed
              image_urls
              voted_by
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
        pollInterval: 500
      })
      .valueChanges.subscribe(result => {
        if (result.data.problems.length > 0) {
          this.problems = result.data.problems;
        }
        console.log("PROBLEMS", this.problems);
      });
  }
}
