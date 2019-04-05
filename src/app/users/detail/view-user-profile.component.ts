import { Component, OnInit } from "@angular/core";
import { UserHandlerService } from "../../services/user-handler.service";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { first, finalize, switchMap } from "rxjs/operators";
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
  user: any;
  userData: any = {};
  interests: any[] = [];
  loggedInUsersProfile: boolean = false;
  objectEntries = Object.entries;
  personas: any = [];

  constructor(
    private userHandlerService: UserHandlerService,
    private route: ActivatedRoute,
    private apollo: Apollo,
    private auth: AuthService
  ) {
    // this.route.params.pipe(first()).subscribe(params => {
    //   console.log(params.id, "params id");
    //   if (params.id) {
    //     this.getProfile(params.id);
    //   }
    // });
  }

  ngOnInit() {
    console.log("init on user profile");
    this.user = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.getProfile(params.get("id"));
      })
    );
    this.user.subscribe(result => {
      this.interests = [];
      this.personas = [];
      console.log(result, "result");
      this.userData = result.data.users[0];
      Object.entries(this.userData).map(data => {
        if (typeof data[1] === "boolean" && data[1]) {
          this.personas.push(data[0]);
        }
      });

      this.interests = result.data.users[0].user_tags.map(tagArray => {
        return tagArray.tag.name;
      });
      console.log(this.userData, "userData");
      if (this.userData.id === Number(this.auth.currentUserValue.id)) {
        this.loggedInUsersProfile = true;
      }
      // console.log(this.problemService.problem, "problem");
    });
  }

  getProfile(id) {
    return this.apollo.watchQuery<any>({
      query: gql`
          {
            users(where: { id: { _eq: ${id} } }) {
              id
              organization
              name
              qualification
              photo_url
              location
              email
              phone_number
              is_ngo
              is_innovator
              is_entrepreneur
              is_expert
              is_incubator
              is_funder
              is_government
              is_beneficiary
              user_tags{
                tag {
                    id
                    name
                }
            }
            }
        }
              
           
        `,
      fetchPolicy: "network-only"

      // pollInterval: 500
    }).valueChanges;
    // .subscribe(result => {
    //   this.interests = [];
    //   this.personas = [];
    //   console.log(result, "result");
    //   this.userData = result.data.users[0];
    //   Object.entries(this.userData).map(data => {
    //     if (typeof data[1] === "boolean" && data[1]) {
    //       this.personas.push(data[0]);
    //     }
    //   });

    //   this.interests = result.data.users[0].user_tags.map(tagArray => {
    //     return tagArray.tag.name;
    //   });
    //   console.log(this.userData, "userData");
    //   if (this.userData.id === Number(this.auth.currentUserValue.id)) {
    //     this.loggedInUsersProfile = true;
    //   }
    //   // console.log(this.problemService.problem, "problem");
    // });
  }
}
