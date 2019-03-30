import { Component, OnInit, Input, OnChanges } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { first, finalize, startWith, take, map } from "rxjs/operators";

import * as Query from "../services/queries";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { AuthService } from "../services/auth.service";

declare var $: any;

@Component({
  selector: "app-global-search-view",
  templateUrl: "./global-search-view.component.html",
  styleUrls: ["./global-search-view.component.css"]
})
export class GlobalSearchViewComponent implements OnInit, OnChanges {
  @Input() problemData: any;
  @Input() userData: any;

  noResult: string = "No Search Results";
  problemSearchResults: any;
  userSearchResults: any;
  globalProblemSearchResults: any;

  constructor(
    private route: ActivatedRoute,
    private apollo: Apollo,
    private auth: AuthService
  ) {}

  ngOnInit() {}

  ngOnChanges() {
    this.route.params.pipe(first()).subscribe(params => {
      console.log("testing=", params);
    });
  }

  globalSearch(searchInput: string) {
    // this.router.navigateByUrl(`/search/${searchInput}`);
    if (searchInput.length >= 3) {
      // this.searchResults = [];
      this.apollo
        .watchQuery<any>({
          query: gql`query {
              search_problems(args: {search: "${searchInput}"},where: { is_draft: { _eq: false } }) {
                id
                title
                description
                modified_at
                image_urls
                featured_url
               
                problem_voters{
                  problem_id
                  user_id
                }
                problem_watchers{
                  problem_id
                  user_id
  
                }
                problem_validations{
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
                , search_users(args:{search:"${searchInput}"}) {
                id
                name
                email
                organization
                location
              }
              
              }`
          // pollInterval: 500
        })
        .valueChanges.subscribe(value => {
          this.globalProblemSearchResults = value.data.search_problems;
          this.userSearchResults = value.data.search_users;
          console.log("Problem results = ", this.globalProblemSearchResults);
          console.log("User results = ", this.userSearchResults);
          // console.log('searchValue : ', searchT);
          // console.log('SearchText : ', this.searchText);
          // console.log('SearchUser : ', this.searchUser);
        });
    } else {
      this.globalProblemSearchResults = null;
      this.userSearchResults = null;
    }
  }
}
