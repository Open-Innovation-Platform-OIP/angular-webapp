import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Apollo, QueryRef } from "apollo-angular";
import gql from "graphql-tag";
import { Observable, Subscription } from "rxjs";
import { AuthService } from "../services/auth.service";
import { isArray } from 'util';
declare const $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, AfterViewInit {

  drafts = [];
  contributions = new Set();
  recommendedProblems = new Set();
  recommendedUsers = new Set();
  draftsQueryRef: QueryRef<any>;
  contributionsQueryRef: QueryRef<any>;
  recommendedProblemsQueryRef: QueryRef<any>;
  recommendedUsersQueryRef: QueryRef<any>;
  draftsSub: Subscription;
  contributionsSub: Subscription;
  recommendedProblemsSub: Subscription;
  recommendedUsersSub: Subscription;
  draftsObs: Observable<any>;
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
  }`;
  
  constructor(private apollo: Apollo, private auth: AuthService) {
    // console.log('dashboard')
  }
  ngOnInit() {
    // console.log('on init')
    this.getDrafts();
    this.getContributions();
    this.getRecommendedProblems();
    this.getRecommendedUsers();
    // this.problemQueryString = '{' + this.problemFields.join('\n') + '}';
  }
  
   getDrafts() {
    //  console.log(this.problemQueryString);
    const draftsQuery = gql`
      {
        problems(where:{is_draft:{_eq:true}, created_by:{_eq: ${this.auth.currentUserValue.id}}}) ${this.problemQueryString}
    }
    `;
    this.draftsQueryRef = this.apollo.watchQuery({
      query: draftsQuery
    });
    // this.draftsObs = this.draftsQueryRef.valueChanges;
    this.draftsSub = this.draftsQueryRef.valueChanges.subscribe(({data}) => {
      // console.log(data);
      if(data.problems.length > 0) {
        this.drafts = data.problems;
      }
    });
  }

  getContributions() {
    console.log(this.problemQueryString);
    const contributionsQuery = gql`
    {
      enrichments(where:{created_by:{_eq: ${this.auth.currentUserValue.id}}}) {
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
      query: contributionsQuery
    });
    this.contributionsSub = this.contributionsQueryRef.valueChanges.subscribe(({data}) => {
      Object.keys(data).map(key => {
        data[key].map(problem => {
          this.contributions.add(Object.values(problem)[0]);
        });
      });
    });
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
      query: recoProblemsQuery
    });
    this.recommendedProblemsSub = this.recommendedProblemsQueryRef.valueChanges.subscribe(({data}) => {
      if(data.users_tags.length > 0) {
        data.users_tags.map(tagData => {
          if (tagData.tag && tagData.tag.tag_problems.length>0) {
            tagData.tag.tag_problems.map(problem => {
              this.recommendedProblems.add(problem.problem);
            })
          }
        })
      }
    });
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
          users(where:{id:{_neq:${this.auth.currentUserValue.id}}}) ${this.userQueryString}
        }
      }
    }
    `;
    this.recommendedUsersQueryRef = this.apollo.watchQuery({
      query: recommendedUsersQuery
    });
    this.recommendedUsersSub = this.recommendedUsersQueryRef.valueChanges.subscribe(({data}) => {
      if(data.users_tags.length > 0) {
        data.users_tags.map(users => {
          if (users.tag && users.tag.tag_users.length>0) {
            users.tag.tag_users.map(user => {
              this.recommendedUsers.add(user.user);
            });
          }
        });
      }
      if (data.users.length > 0) {
        data.users.map(org => {
          if (org.organizationByOrganizationId && org.organizationByOrganizationId.users.length > 0) {
            org.organizationByOrganizationId.users.map(user => {
              // console.log(user);
              this.recommendedUsers.add(user);
            })
          }
        });
      }
    });
  }

   ngAfterViewInit() {
   }
}
