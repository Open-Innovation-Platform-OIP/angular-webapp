import { Component, OnInit, OnDestroy } from "@angular/core";
import { Apollo, QueryRef } from "apollo-angular";
import gql from "graphql-tag";
import { Observable, Subscription } from "rxjs";
import { AuthService } from "../services/auth.service";
import { ProblemService } from "../services/problem.service";
import { isArray } from "util";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { UsersService } from "../services/users.service";
import { FilterService } from "../services/filter.service";
import { ActivatedRoute } from "@angular/router";

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
  userSolutions = [];
  contributions = {};
  solutionContributions = {};
  recommendedProblems = {};
  recommendedUsers = {};
  showLoader = true;
  draftsQueryRef: QueryRef<any>;
  // solutionDraftsQueryRef: QueryRef<any>;
  userProblemsQueryRef: QueryRef<any>;
  contributionsQueryRef: QueryRef<any>;
  userSolutionsQueryRef: QueryRef<any>;
  recommendedProblemsQueryRef: QueryRef<any>;
  recommendedUsersQueryRef: QueryRef<any>;
  draftsSub: Subscription;
  userProblemsQuerySub: Subscription;
  // solutionDraftsSub: Subscription;
  contributionsSub: Subscription;
  userSolutionsQuerySub: Subscription;
  recommendedProblemsSub: Subscription;
  recommendedUsersSub: Subscription;
  // problemFields = ['id', 'featured_url','title','description','location','problem_voters{user_id}','problem_watchers{user_id}','problem_validations{user_id}'];
  problemQueryString = `{
    id
    is_draft
    featured_url
    title
    description
  
    problem_voters{user_id}
    problem_watchers{user_id}
    problem_validations{user_id}
    problem_locations{
      location{
        id
        location_name
        lat
        long
      }
    }
    updated_at
    edited_at
  }`;

  solutionQueryString = `{
    id
    is_draft
    featured_url
    title
    description
    
    solution_voters{user_id}
    solution_watchers{user_id}
    solution_validations{user_id}
    updated_at
    edited_at
  }`;
  userQueryString = `{
    id
      name
      photo_url
      organizationByOrganizationId {
        name
      }
      

      problems(where: { is_draft: { _eq: false } }){
        id
      }
      problem_collaborators {
        intent
      }
      problem_validations {
        comment
      }
      enrichments(where: { is_deleted: { _eq: false } }){
        id
      }
      users_tags{
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
    private userService: UsersService,
    private filterService: FilterService,
    private activatedRoute: ActivatedRoute
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
    // this.getSolutionDrafts();
    this.getUsersSolutions();
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
        }}} order_by: {edited_at: desc}) ${this.problemQueryString}
        ,
        
          solutions(where:{is_draft:{_eq:true},is_deleted:{_eq:false}, created_by:{_eq: ${
            this.auth.currentUserValue.id
          }}} order_by: {edited_at: desc}) ${this.solutionQueryString}
      


    }
    `;
    this.draftsQueryRef = this.apollo.watchQuery({
      query: draftsQuery,
      pollInterval: 1000,
      fetchPolicy: "network-only"
    });

    // this.draftsObs = this.draftsQueryRef.valueChanges;
    this.draftsSub = this.draftsQueryRef.valueChanges.subscribe(({ data }) => {
      // console.log(data, "drafts");
      if (data.problems.length > 0) {
        let problems_solutions = data.problems.concat(data.solutions);
        problems_solutions.sort((a, b) => {
          if (a.edited_at < b.edited_at) {
            return 1;
          }
          if (a.edited_at > b.edited_at) {
            return -1;
          }
        });
        // console.log(problems_solutions, "solutions and problems");
        this.drafts = problems_solutions;
        console.log(this.drafts, "drafts");
        this.userService.dashboardDrafts = data.problems;
        this.userService.solutionDrafts = data.solutions;
      }
    });
  }

  // getSolutionDrafts() {
  //   const solutionDraftsQuery = gql`
  //     {
  //       solutions(where:{is_draft:{_eq:true},is_deleted:{_eq:false}, created_by:{_eq: ${
  //         this.auth.currentUserValue.id
  //       }}} order_by: {edited_at: desc}) ${this.solutionQueryString}
  //   }
  //   `;

  //   this.solutionDraftsQueryRef = this.apollo.watchQuery({
  //     query: solutionDraftsQuery,
  //     pollInterval: 1000,
  //     fetchPolicy: "network-only"
  //   });
  //   // this.draftsObs = this.draftsQueryRef.valueChanges;
  //   this.solutionDraftsSub = this.solutionDraftsQueryRef.valueChanges.subscribe(
  //     ({ data }) => {
  //       // console.log(data);
  //       if (data.solutions.length > 0) {
  //         // this.drafts = data.solutions;
  //         this.userService.solutionDrafts = data.solutions;
  //         console.log(this.userService.solutionDrafts, "user solution drafts");
  //       }
  //     },
  //     error => {
  //       console.error(JSON.stringify(error));
  //     }
  //   );
  // }

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
          this.userService.dashboardUserProblems = data.problems;
        }
      }
    );
  }

  getUsersSolutions() {
    const userSolutionQuery = gql`
    {
      solutions( 
        where:{ _and:[
        { is_draft: {_eq: false}},
        {created_by: {_eq: ${this.auth.currentUserValue.id} }}
      ]
    } order_by: {updated_at: desc}) ${this.solutionQueryString}
    }
    `;
    this.userSolutionsQueryRef = this.apollo.watchQuery({
      query: userSolutionQuery,
      pollInterval: 1000,
      fetchPolicy: "network-only"
    });
    this.userSolutionsQuerySub = this.userSolutionsQueryRef.valueChanges.subscribe(
      ({ data }) => {
        if (data.solutions.length > 0) {
          this.userSolutions = data.solutions;
          this.userService.dashboardUserSolutions = data.solutions;
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
       problem ${this.problemQueryString}
     }
     problem_validations(where:{user_id:{_eq: ${
       this.auth.currentUserValue.id
     }}}) {
       problem ${this.problemQueryString}
     }
     problem_collaborators(where:{user_id:{_eq: ${
       this.auth.currentUserValue.id
     }}}) {
       problem ${this.problemQueryString}
     }
     discussions(where:{created_by:{_eq: ${this.auth.currentUserValue.id}}}) {
       problem ${this.problemQueryString}
     }


     solution_validations(where:{user_id:{_eq: ${
       this.auth.currentUserValue.id
     }}}) {
      solution ${this.solutionQueryString}
    }
    solution_collaborators(where:{user_id:{_eq: ${
      this.auth.currentUserValue.id
    }}}) {
      solution ${this.solutionQueryString}
    }
    discussions(where:{created_by:{_eq: ${this.auth.currentUserValue.id}}}) {
      solution ${this.solutionQueryString}
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

                this.userService.dashboardContributions[
                  problem["id"]
                ] = problem;
                // console.log(
                //   "test contributions",
                //   this.problemService.dashboardContributions
                // );
              }
            } else if (p.solution) {
              const solution = p.solution;
              // console.log(problem, "problem");
              if (solution["id"]) {
                this.contributions[solution["id"]] = solution;
                // console.log(this.contributions, "contributions");

                this.userService.dashboardSolutionContributions[
                  solution["id"]
                ] = solution;
                // console.log(
                //   "test contributions",
                //   this.problemService.dashboardContributions
                // );
              }
            }
            console.log(this.contributions, "contributions");
            // this.contributions.add(Object.values(problem)[0]);
          });
        });
      },
      error => {
        console.error(JSON.stringify(error));
      }
    );
  }

  getContributionsOnSolutions() {
    // const solutionContributionsQuery = gql`
    // {
    //   enrichments( where:{ _and: [
    //     { created_by: {_eq: ${this.auth.currentUserValue.id}}},
    //     { is_deleted: {_eq: false}}
    //   ] }) {
    //    problemsByproblemId ${this.problemQueryString}
    //  }
    //  validations(where:{user_id:{_eq: ${this.auth.currentUserValue.id}}}) {
    //    problem ${this.problemQueryString}
    //  }
    //  collaborators(where:{user_id:{_eq: ${this.auth.currentUserValue.id}}}) {
    //    problem ${this.problemQueryString}
    //  }
    //  discussions(where:{created_by:{_eq: ${this.auth.currentUserValue.id}}}) {
    //    problemsByproblemId ${this.problemQueryString}
    //  }
    // }
    // `;
    // this.contributionsQueryRef = this.apollo.watchQuery({
    //   query: contributionsQuery,
    //   pollInterval: 1000,
    //   fetchPolicy: "network-only"
    // });
    // this.contributionsSub = this.contributionsQueryRef.valueChanges.subscribe(
    //   ({ data }) => {
    //     // console.log(data, "data from contributions");
    //     Object.keys(data).map(key => {
    //       data[key].map(p => {
    //         // console.log(p, "p");
    //         if (p.problem || p.problemsByproblemId) {
    //           // console.log(p, "p");
    //           const problem = p.problem || p.problemsByproblemId;
    //           // console.log(problem, "problem");
    //           if (problem["id"]) {
    //             this.contributions[problem["id"]] = problem;
    //             // console.log(this.contributions, "contributions");
    //             this.userService.dashboardContributions[
    //               problem["id"]
    //             ] = problem;
    //             // console.log(
    //             //   "test contributions",
    //             //   this.problemService.dashboardContributions
    //             // );
    //           }
    //         }
    //         // this.contributions.add(Object.values(problem)[0]);
    //       });
    //     });
    //   },
    //   error => {
    //     console.error(JSON.stringify(error));
    //   }
    // );
  }

  getRecommendedProblems() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.filterService.filterSector(params);

      const recoProblemsQuery = gql`
    {
     
      users_tags(where:{ _and: [
        {user_id:{_eq:${this.auth.currentUserValue.id}}},
        { tag_id:{${this.filterService.sector_filter_query}}}
      ]}) {
        tag{
          problems_tags {
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
                    this.userService.dashboardRecommendations[
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
    });
  }

  getRecommendedUsers() {
    const recommendedUsersQuery = gql`
    {
      users_tags(where:{user_id:{_eq:${this.auth.currentUserValue.id}}}) {
        tag{
          users_tags (where:{user_id:{_neq:${this.auth.currentUserValue.id}}}){
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
                  this.userService.dashboardUsers[user["id"]] = user;
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
    this.userSolutionsQueryRef.stopPolling();
    this.draftsSub.unsubscribe();
    this.contributionsSub.unsubscribe();
    this.recommendedProblemsSub.unsubscribe();
    this.recommendedUsersSub.unsubscribe();
    // this.solutionDraftsQueryRef.stopPolling();
    // this.solutionDraftsSub.unsubscribe();
    this.userSolutionsQuerySub.unsubscribe();
  }
}
