import { Component, OnInit } from "@angular/core";
import * as Query from '../../services/queries';
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Observable } from "rxjs";

@Component({
  selector: "app-problems-view",
  templateUrl: "./problems-view.component.html",
  styleUrls: ["./problems-view.component.css"]
})
export class ProblemsViewComponent implements OnInit {
  problems = [];
  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.apollo.watchQuery<any>({
      query: Query.GetQuery
    }).valueChanges.subscribe(result => {
      if (result.data.problems.length > 0) {
        this.problems = result.data.problems;
      }
    });

  }
}
