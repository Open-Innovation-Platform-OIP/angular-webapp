import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { HttpClient } from '@angular/common/http';
import { FilterService } from '../services/filter.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(
    private apollo: Apollo,
    private http: HttpClient,
    private filterService: FilterService
  ) {}

  globalSearch(keyword) {
    return this.http.post(
      'https://elasticsearch-microservice.dev.jaagalabs.com/global_search',
      { keyword: keyword, filter: this.filterService.sector_filter_query }
    );
  }

  userSearch(searchInput) {
    return this.apollo.watchQuery<any>({
      query: gql`query {
        search_users(args:{search:"${searchInput}"}) {





          id
          name
          email
          photo_url
          organization
          user_locations{
            location{
              location_name
              id
              location
              lat
              long

            }
          }
          users_tags{
            tag {
                id
                name
            }
        }
        problems(where: { is_draft: { _eq: false } }){
          id

        }
        solution_collaborators {
          intent
        }
        problem_collaborators {
          intent
        }
        enrichments(where: { is_deleted: { _eq: false } }){
          id
        }

        }
      }


        `
    }).valueChanges;
  }

  problemSearch(searchInput) {
    return this.apollo.watchQuery<any>({
      query: gql`query {
          search_problems_multiword(args: {search: "${searchInput}"},where: { is_draft: { _eq: false } }) {
            id
            title
            description
            edited_at
            updated_at
            image_urls
            featured_url
            problem_locations{
              location{
                id
                location_name
                lat
                long
              }
            }






            problem_voters{
              problem_id
              user_id
            }
            problem_watchers{
              problem_id
              user_id

            }
            problem_validations {
              comment
              agree
              created_at
              files
              user_id
              edited_at
              is_deleted

              problem_id
              user {
                id
                name
              }

            }
        }


    }
        `
    }).valueChanges;
  }

  solutionSearch(searchInput) {
    return this.apollo.watchQuery<any>({
      query: gql`query {
          search_solutions_v2(args: {search: "${searchInput}"},where: { is_draft: { _eq: false } }) {
            id
            title
            description
            edited_at
            updated_at
            image_urls
            featured_url

            solution_voters{
              solution_id
              user_id
            }
            solution_watchers{
              solution_id
              user_id

            }
            solution_validations {
              comment
              agree
              created_at
              files
              user_id
              edited_at
              is_deleted

              solution_id
              user {
                id
                name
              }

            }
        }
    }
        `
    }).valueChanges;
  }
}
