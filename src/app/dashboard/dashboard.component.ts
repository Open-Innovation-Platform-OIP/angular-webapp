import { Component, OnInit, OnDestroy } from "@angular/core";
import { Apollo, QueryRef } from "apollo-angular";
import gql from "graphql-tag";
import { Observable, Subscription } from "rxjs";
import { AuthService } from "../services/auth.service";
import { ProblemService } from "../services/problem.service";
import { isArray } from "util";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { UsersService } from "../services/users.service";

declare const $: any;

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html"
})
export class DashboardComponent implements OnInit, OnDestroy {
  objectValues = Object["values"];
  objectKeys = Object["keys"];
  drafts = [];
  userProblems = [];
  contributions = {};
  recommendedProblems = {};
  recommendedUsers = {};
  showLoader = true;
  draftsQueryRef: QueryRef<any>;
  userProblemsQueryRef: QueryRef<any>;
  contributionsQueryRef: QueryRef<any>;
  recommendedProblemsQueryRef: QueryRef<any>;
  recommendedUsersQueryRef: QueryRef<any>;
  draftsSub: Subscription;
  userProblemsQuerySub: Subscription;
  contributionsSub: Subscription;
  recommendedProblemsSub: Subscription;
  recommendedUsersSub: Subscription;
  // problemFields = ['id', 'featured_url','title','description','location','problem_voters{user_id}','problem_watchers{user_id}','problem_validations{validated_by}'];
  problemQueryString = `{
    id
    is_draft
    featured_url
    title
    description
    location
    problem_voters{user_id}
    problem_watchers{user_id}
    problem_validations{validated_by}
    updated_at
  }`;
  userQueryString = `{
    id
      name
      photo_url
      organizationByOrganizationId {
        name
      }
      location

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
      user_tags{
        tag {
            id
            name
        }
    }
  }`;

  constructor(
    private apollo: Apollo,
    private auth: AuthService,
    private problemService: ProblemService,
    private ngxService: NgxUiLoaderService,
    private userService: UsersService
  ) {
    // console.log('dashboard')
  }
  ngOnInit() {
    // start loader
    this.ngxService.start();
    console.log(this.auth.currentUserValue, "current user value");
    // console.log('on init')
    this.getDrafts();
    this.getUsersProblems();
    this.getContributions();
    this.getRecommendedProblems();
    this.getRecommendedUsers();
    // this.problemQueryString = '{' + this.problemFields.join('\n') + '}';
  }

  isNewUser() {
    if (
      this.drafts.length ||
      this.userProblems.length ||
      this.objectKeys(this.contributions).length ||
      this.objectKeys(this.recommendedProblems).length ||
      this.objectKeys(this.recommendedUsers).length
    ) {
      this.showLoader = false;
      this.ngxService.stop();
      return false;
    } else {
      this.showLoader = false;
      this.ngxService.stop();
      return true;
    }
  }

  getDrafts() {
    //  console.log(this.problemQueryString);
    const draftsQuery = gql`
      {
        problems(where:{is_draft:{_eq:true},is_deleted:{_eq:false}, created_by:{_eq: ${
          this.auth.currentUserValue.id
        }}} order_by: {modified_at: desc}) ${this.problemQueryString}
    }
    `;
    this.draftsQueryRef = this.apollo.watchQuery({
      query: draftsQuery,
      pollInterval: 1000,
      fetchPolicy: "network-only"
    });
    // this.draftsObs = this.draftsQueryRef.valueChanges;
    this.draftsSub = this.draftsQueryRef.valueChanges.subscribe(({ data }) => {
      // console.log(data);
      if (data.problems.length > 0) {
        this.drafts = data.problems;
        this.problemService.dashboardDrafts = data.problems;
      }
    });
  }

  getUsersProblems() {
    const userProblemsQuery = gql`
    {
      problems( 
        where:{ _and:[
        { is_draft: {_eq: false}},
        {created_by: {_eq: ${this.auth.currentUserValue.id} }}
      ]
    } order_by: {updated_at: desc}) ${this.problemQueryString}
    }
    `;
    this.userProblemsQueryRef = this.apollo.watchQuery({
      query: userProblemsQuery,
      pollInterval: 1000,
      fetchPolicy: "network-only"
    });
    this.userProblemsQuerySub = this.userProblemsQueryRef.valueChanges.subscribe(
      ({ data }) => {
        if (data.problems.length > 0) {
          this.userProblems = data.problems;
          this.problemService.dashboardUserProblems = data.problems;
        }
      }
    );
  }

  getContributions() {
    // console.log(this.problemQueryString);
    const contributionsQuery = gql`
    {
      enrichments( where:{ _and: [
        { created_by: {_eq: ${this.auth.currentUserValue.id}}},
        { is_deleted: {_eq: false}}
      ] }) {
       problemsByproblemId ${this.problemQueryString}
     }
     validations(where:{validated_by:{_eq: ${this.auth.currentUserValue.id}}}) {
       problem ${this.problemQueryString}
     }
     collaborators(where:{user_id:{_eq: ${this.auth.currentUserValue.id}}}) {
       problem ${this.problemQueryString}
     }
     discussions(where:{created_by:{_eq: ${this.auth.currentUserValue.id}}}) {
       problemsByproblemId ${this.problemQueryString}
     }
    }
    `;
    this.contributionsQueryRef = this.apollo.watchQuery({
      query: contributionsQuery,
      pollInterval: 1000,
      fetchPolicy: "network-only"
    });
    this.contributionsSub = this.contributionsQueryRef.valueChanges.subscribe(
      ({ data }) => {
        // console.log(data, "data from contributions");
        Object.keys(data).map(key => {
          data[key].map(p => {
            // console.log(p, "p");
            if (p.problem || p.problemsByproblemId) {
              // console.log(p, "p");
              const problem = p.problem || p.problemsByproblemId;
              // console.log(problem, "problem");
              if (problem["id"]) {
                this.contributions[problem["id"]] = problem;
                // console.log(this.contributions, "contributions");

                this.problemService.dashboardContributions[
                  problem["id"]
                ] = problem;
                // console.log(
                //   "test contributions",
                //   this.problemService.dashboardContributions
                // );
              }
            }
            // this.contributions.add(Object.values(problem)[0]);
          });
        });
      },
      error => {
        console.error(JSON.stringify(error));
      }
    );
  }

  getRecommendedProblems() {
    const recoProblemsQuery = gql`
    {
      users_tags(where:{user_id:{_eq:${this.auth.currentUserValue.id}}}) {
        tag{
          tag_problems{
            problem ${this.problemQueryString}
          }
        }
      }
    }
    `;
    this.recommendedProblemsQueryRef = this.apollo.watchQuery({
      query: recoProblemsQuery,
      pollInterval: 1000,
      fetchPolicy: "network-only"
    });
    this.recommendedProblemsSub = this.recommendedProblemsQueryRef.valueChanges.subscribe(
      ({ data }) => {
        if (data.users_tags.length > 0) {
          data.users_tags.map(tagData => {
            if (tagData.tag && tagData.tag.tag_problems.length > 0) {
              tagData.tag.tag_problems.map(p => {
                if (p && p.problem && p.problem.id) {
                  const problem = p.problem;
                  this.recommendedProblems[problem["id"]] = problem;
                  this.problemService.dashboardRecommendations[
                    problem["id"]
                  ] = problem;
                }
                // this.recommendedProblems.add(problem.problem);
              });
            }
          });
        }
      },
      error => {
        console.error(JSON.stringify(error));
      }
    );
  }

  getRecommendedUsers() {
    const recommendedUsersQuery = gql`
    {
      users_tags(where:{user_id:{_eq:${this.auth.currentUserValue.id}}}) {
        tag{
          tag_users(where:{user_id:{_neq:${this.auth.currentUserValue.id}}}){
            user ${this.userQueryString}
          }
        }
      }
      users(where:{id:{_eq:${this.auth.currentUserValue.id}}}) {
        organizationByOrganizationId{
          users(where:{id:{_neq:${this.auth.currentUserValue.id}}}) ${
      this.userQueryString
    }
        }
      }
    }
    `;
    this.recommendedUsersQueryRef = this.apollo.watchQuery({
      query: recommendedUsersQuery,
      pollInterval: 1000,
      fetchPolicy: "network-only"
    });
    this.recommendedUsersSub = this.recommendedUsersQueryRef.valueChanges.subscribe(
      ({ data }) => {
        if (data.users_tags.length > 0) {
          data.users_tags.map(users => {
            if (users.tag && users.tag.tag_users.length > 0) {
              users.tag.tag_users.map(u => {
                if (u && u.user && u.user.id) {
                  const user = u.user;
                  this.recommendedUsers[user.id] = user;
                }
                // this.recommendedUsers.add(user.user);
              });
            }
          });
        }
        if (data.users.length > 0) {
          data.users.map(org => {
            if (
              org.organizationByOrganizationId &&
              org.organizationByOrganizationId.users.length > 0
            ) {
              org.organizationByOrganizationId.users.map(user => {
                if (user && user.id) {
                  this.recommendedUsers[user["id"]] = user;
                  this.problemService.dashboardUsers[user["id"]] = user;
                }
                // this.recommendedUsers.add(user);
              });
            }
          });
        }
      },
      error => {
        console.error(JSON.stringify(error));
      }
    );
  }

  ngOnDestroy() {
    this.showLoader = true;
    this.draftsQueryRef.stopPolling();
    this.contributionsQueryRef.stopPolling();
    this.recommendedProblemsQueryRef.stopPolling();
    this.recommendedUsersQueryRef.stopPolling();
    this.draftsSub.unsubscribe();
    this.contributionsSub.unsubscribe();
    this.recommendedProblemsSub.unsubscribe();
    this.recommendedUsersSub.unsubscribe();
  }
}
