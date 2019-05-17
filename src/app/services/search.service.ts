import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";

@Injectable({
  providedIn: "root"
})
export class SearchService {
  constructor(private apollo: Apollo) {}

  userSearch(searchInput) {
    return this.apollo.watchQuery<any>({
      query: gql`query {
        search_users(args:{search:"${searchInput}"}) {





          id
          name
          email
          photo_url
          organization
          location
          user_tags{
            tag {
                id
                name
            }
        }
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
         
        }
      }
    
         
        `
    }).valueChanges;
  }

  problemSearch(searchInput) {
    return this.apollo.watchQuery<any>({
      query: gql`query {
          search_problems_multiword(args: {search: "${searchInput}"},where: { is_draft: { _eq: false } },order_by: {problem_voters_aggregate: {count: desc}}) {
            id
            title
            description
            modified_at
            updated_at
            image_urls
            featured_url

            problem_voters_aggregate {
              aggregate {
                count
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
              validated_by
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
      // pollInterval: 500
    }).valueChanges;
  }

  solutionSearch(searchInput) {
    return this.apollo.watchQuery<any>({
      query: gql`query {
          search_solutions_v2(args: {search: "${searchInput}"}) {
            id
            title
            description
            modified_at
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
              validated_by
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
      // pollInterval: 500
    }).valueChanges;
  }
}
