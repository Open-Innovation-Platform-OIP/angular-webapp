import { Component, OnInit, Input, OnChanges } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { first, finalize, startWith, take, map } from "rxjs/operators";
import { SearchService } from "../services/search.service";

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
  @Input() solutionData: any;

  noResult: string = "No Search Results";
  problemSearchResults: any = [];
  userSearchResults: any = [];
  solutionSearchResults: any = [];
  globalProblemSearchResults: any = [];

  constructor(
    private route: ActivatedRoute,
    private apollo: Apollo,
    private auth: AuthService,
    private router: Router,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    // this.router.routeReuseStrategy.shouldReuseRoute = function() {
    //   return false;
    // };
    // this.router.events.subscribe(evt => {
    //   if (evt instanceof NavigationEnd) {
    //     this.router.navigated = false;
    //     window.scrollTo(0, 0);
    //   }
    // });
  }

  ngOnChanges() {
    this.route.params.pipe(first()).subscribe(params => {
      console.log("testing=", params);
    });
  }

  globalSearch(searchInput: string) {
    // this.router.navigateByUrl(`/search/${searchInput}`);
    if (searchInput.length >= 3) {
      this.globalProblemSearchResults = [];
      this.userSearchResults = [];
      this.solutionSearchResults = [];
      // this.searchResults = [];
      this.searchService.problemSearch(searchInput).subscribe(
        value => {
          this.globalProblemSearchResults =
            value.data.search_problems_multiword;
        },
        error => {
          console.error(JSON.stringify(error));
        }
      );

      this.searchService.userSearch(searchInput).subscribe(
        value => {
          this.userSearchResults = value.data.search_users;
        },
        error => {
          console.error(JSON.stringify(error));
        }
      );

      this.searchService.solutionSearch(searchInput).subscribe(
        value => {
          this.solutionSearchResults = value.data.search_solutions_v2;
        },
        error => {
          console.log(JSON.stringify(error));
        }
      );
    } else {
      this.globalProblemSearchResults = [];
      this.userSearchResults = [];
      this.solutionSearchResults = [];
    }
  }
}
