import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ProblemService } from '../services/problem.service';
import { isArray } from 'util';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { UsersService } from '../services/users.service';
import { FilterService } from '../services/filter.service';
import { ActivatedRoute } from '@angular/router';

declare const $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  objectValues = Object['values'];
  objectKeys = Object['keys'];
  drafts = [];
  userProblems = [];
  userSolutions = [];
  contributions = {};
  solutionContributions = {};
  recommendedProblems = {};
  recommendedUsers = {};
  showLoader = true;
  draftsQueryRef: QueryRef<any>;

  userProblemsQueryRef: QueryRef<any>;
  contributionsQueryRef: QueryRef<any>;
  userSolutionsQueryRef: QueryRef<any>;
  recommendedProblemsQueryRef: QueryRef<any>;
  recommendedUsersQueryRef: QueryRef<any>;
  draftsSub: Subscription;
  userProblemsQuerySub: Subscription;

  contributionsSub: Subscription;
  userSolutionsQuerySub: Subscription;
  recommendedProblemsSub: Subscription;
  recommendedUsersSub: Subscription;

  problemQueryString = `{
    id
    is_draft
    featured_url
    title
    description
    user_id
  
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

      user_locations{
        location{
          id
          location_name
          location
          lat
         long
        }
      }

      email_private
                number_private
                organization_private
                interests_private
                location_private
                persona_private
      

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
  ) {}
  ngOnInit() {
    // start loader
    this.ngxService.start();

    this.getDrafts();
    this.getUsersProblems();
    this.getContributions();
    this.getRecommendedProblems();
    this.getRecommendedUsers();

    this.getUsersSolutions();
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
    const draftsQuery = gql`
      {
        problems(where:{is_draft:{_eq:true},is_deleted:{_eq:false}, user_id:{_eq: ${this.auth.currentUserValue.id}},problems_tags:{tag_id:{${this.filterService.sector_filter_query}}}} order_by: {edited_at: desc}) ${this.problemQueryString}
        ,
        
          solutions(where:{is_draft:{_eq:true},is_deleted:{_eq:false}, user_id:{_eq: ${this.auth.currentUserValue.id}},solutions_tags:{tag_id:{${this.filterService.sector_filter_query}}}} order_by: {edited_at: desc}) ${this.solutionQueryString}
      


    }
    `;
    this.draftsQueryRef = this.apollo.watchQuery({
      query: draftsQuery,
      pollInterval: 1000,
      fetchPolicy: 'network-only'
    });

    this.draftsSub = this.draftsQueryRef.valueChanges.subscribe(({ data }) => {
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

        this.drafts = problems_solutions;

        this.userService.dashboardDrafts = data.problems;
        this.userService.solutionDrafts = data.solutions;
      }
    });
  }

  getUsersProblems() {
    const userProblemsQuery = gql`
    {
      problems( 
        where:{ _and:[
        { is_draft: {_eq: false}},
        {user_id: {_eq: ${this.auth.currentUserValue.id} }},
        {problems_tags:{tag_id:{${this.filterService.sector_filter_query}}}}
      ],
      
    } order_by: {updated_at: desc}) ${this.problemQueryString}
    }
    `;
    this.userProblemsQueryRef = this.apollo.watchQuery({
      query: userProblemsQuery,
      pollInterval: 1000,
      fetchPolicy: 'network-only'
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
        {user_id: {_eq: ${this.auth.currentUserValue.id} }},
        {solutions_tags:{tag_id:{${this.filterService.sector_filter_query}}}}
      ]
    } order_by: {updated_at: desc}) ${this.solutionQueryString}
    }
    `;
    this.userSolutionsQueryRef = this.apollo.watchQuery({
      query: userSolutionQuery,
      pollInterval: 1000,
      fetchPolicy: 'network-only'
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
    const contributionsQuery = gql`
    {
      enrichments( where:{ _and: [
        { user_id: {_eq: ${this.auth.currentUserValue.id}}},
        { is_deleted: {_eq: false}},
        {problem:{problems_tags:{tag_id:{${this.filterService.sector_filter_query}}}}}
      ] }) {
       problem ${this.problemQueryString}
     }
     problem_validations(where:{user_id:{_eq: ${this.auth.currentUserValue.id}},problem:{problems_tags:{tag_id:{${this.filterService.sector_filter_query}}}}}) {
       problem ${this.problemQueryString}
     }
     problem_collaborators(where:{user_id:{_eq: ${this.auth.currentUserValue.id}},problem:{problems_tags:{tag_id:{${this.filterService.sector_filter_query}}}}}) {
       problem ${this.problemQueryString}
     }
     discussions(where:{user_id:{_eq: ${this.auth.currentUserValue.id}},problem:{problems_tags:{tag_id:{${this.filterService.sector_filter_query}}}}}) {
       problem ${this.problemQueryString}
     }


     solution_validations(where:{user_id:{_eq: ${this.auth.currentUserValue.id}},solution:{solutions_tags:{tag_id:{${this.filterService.sector_filter_query}}}}}) {
      solution ${this.solutionQueryString}
    }
    solution_collaborators(where:{user_id:{_eq: ${this.auth.currentUserValue.id}},solution:{solutions_tags:{tag_id:{${this.filterService.sector_filter_query}}}}}) {
      solution ${this.solutionQueryString}
    }
   
    }
    `;
    this.contributionsQueryRef = this.apollo.watchQuery({
      query: contributionsQuery,
      pollInterval: 1000,
      fetchPolicy: 'network-only'
    });
    this.contributionsSub = this.contributionsQueryRef.valueChanges.subscribe(
      ({ data }) => {
        Object.keys(data).map(key => {
          data[key].map(p => {
            if (p.problem || p.problemsByproblemId) {
              const problem = p.problem || p.problemsByproblemId;

              if (problem['id']) {
                this.contributions[problem['id']] = problem;

                this.userService.dashboardContributions[
                  problem['id']
                ] = problem;
              }
            } else if (p.solution) {
              const solution = p.solution;

              if (solution['id']) {
                this.contributions[solution['id']] = solution;

                this.userService.dashboardSolutionContributions[
                  solution['id']
                ] = solution;
              }
            }
          });
        });
      },
      error => {
        console.error(JSON.stringify(error));
      }
    );
  }

  getContributionsOnSolutions() {}

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
        fetchPolicy: 'network-only'
      });
      this.recommendedProblemsSub = this.recommendedProblemsQueryRef.valueChanges.subscribe(
        ({ data }) => {
          if (data.users_tags.length > 0) {
            data.users_tags.map(tagData => {
              if (tagData.tag && tagData.tag.problems_tags.length > 0) {
                tagData.tag.problems_tags.map(p => {
                  if (p && p.problem && p.problem.id) {
                    const problem = p.problem;

                    this.recommendedProblems[problem['id']] = problem;
                    this.userService.dashboardRecommendations[
                      problem['id']
                    ] = problem;
                  }
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
      users_tags(where:{user_id:{_eq:${this.auth.currentUserValue.id}},user:{users_tags:{tag:{id:{${this.filterService.sector_filter_query}}}}}}) {
        tag{
          users_tags (where:{user_id:{_neq:${this.auth.currentUserValue.id}}}){
            user ${this.userQueryString}
          }
        }
      }
      users(where:{id:{_eq:${this.auth.currentUserValue.id}},users_tags:{tag:{id:{${this.filterService.sector_filter_query}}}}}) {
        organizationByOrganizationId{
          users(where:{id:{_neq:${this.auth.currentUserValue.id}}}) ${this.userQueryString}
        }
      }
    }
    `;
    this.recommendedUsersQueryRef = this.apollo.watchQuery({
      query: recommendedUsersQuery,
      pollInterval: 1000,
      fetchPolicy: 'network-only'
    });
    this.recommendedUsersSub = this.recommendedUsersQueryRef.valueChanges.subscribe(
      ({ data }) => {
        if (data.users_tags.length > 0) {
          data.users_tags.map(users => {
            if (users.tag && users.tag.users_tags.length > 0) {
              users.tag.users_tags.map(u => {
                if (u && u.user && u.user.id) {
                  const user = u.user;
                  this.recommendedUsers[user.id] = user;
                }
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
                  this.recommendedUsers[user['id']] = user;
                  this.userService.dashboardUsers[user['id']] = user;
                }
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

    this.userSolutionsQuerySub.unsubscribe();
  }
}
