import { Component, OnInit } from "@angular/core";
import { UserHandlerService } from "../../services/user-handler.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { first, finalize } from "rxjs/operators";
import * as Query from "../../services/queries";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { AuthService } from "../../services/auth.service";
@Component({
  selector: "app-view-user-profile",
  templateUrl: "./view-user-profile.component.html",
  styleUrls: ["./view-user-profile.component.css"]
})
export class ViewUserProfileComponent implements OnInit {
  userData: any = {};
  interests: any[];
  loggedInUsersProfile: boolean = false;
  constructor(
    private userHandlerService: UserHandlerService,
    private route: ActivatedRoute,
    private apollo: Apollo,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.route.params.pipe(first()).subscribe(params => {
      console.log(params.id, "params id");
      if (params.id) {
        this.apollo
          .watchQuery<any>({
            query: gql`
          {
            users(where: { id: { _eq: ${params.id} } }) {
              id
              organization
              name
              qualification
              photo_url
              location
              email
              
            }
          }
        `,
            pollInterval: 500
          })
          .valueChanges.subscribe(result => {
            console.log(result, "result");
            this.userData = result.data.users[0];
            console.log(this.userData, "userData");
            if (this.userData.id === Number(this.auth.currentUserValue.id)) {
              this.loggedInUsersProfile = true;
            }
            // console.log(this.problemService.problem, "problem");
          });

        this.getInterests(params.id);
      }
    });
  }
  getInterests(id) {
    this.apollo
      .watchQuery<any>({
        query: gql`
  {
    users(where: { id: { _eq: ${id} } }) {
      id
      user_tags{
        tag {
          id
          name
        }
      }
    }
  }
`,
        pollInterval: 500
      })
      .valueChanges.subscribe(
        result => {
          if (result.data.users[0].user_tags) {
            this.interests = result.data.users[0].user_tags.map(tagArray => {
              return tagArray.tag.name;
            });
            console.log(this.interests, "interests");
          }
        },
        error => {
          console.log("error", error);
        }
      );
  }
}
