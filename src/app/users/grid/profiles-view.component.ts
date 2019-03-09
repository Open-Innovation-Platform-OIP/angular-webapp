import { Component, OnInit } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import * as Query from '../../services/queries';

@Component({
  selector: "app-profiles-view",
  templateUrl: "./profiles-view.component.html",
  styleUrls: ["./profiles-view.component.css"]
})
export class ProfilesViewComponent implements OnInit {
  users: any;
  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.users = this.apollo.watchQuery<any>({
      query: Query.GetUsers
    }).valueChanges;
  }
}
