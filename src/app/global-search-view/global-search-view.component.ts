import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { first, finalize, startWith, take, map } from 'rxjs/operators';
import { SearchService } from '../services/search.service';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { AuthService } from '../services/auth.service';
import { LiveAnnouncer, AriaLivePoliteness } from '@angular/cdk/a11y';

declare var $: any;

@Component({
  selector: 'app-global-search-view',
  templateUrl: './global-search-view.component.html',
  styleUrls: ['./global-search-view.component.css']
})
export class GlobalSearchViewComponent implements OnInit, OnChanges {
  @Input() problemData: any;
  @Input() userData: any;
  @Input() solutionData: any;
  newAnnoucement: Promise<void>;

  noResult = 'No Search Results';
  problemSearchResults: any = [];
  userSearchResults: any = [];
  solutionSearchResults: any = [];
  globalProblemSearchResults: any = [];

  constructor(
    private route: ActivatedRoute,
    private apollo: Apollo,
    private auth: AuthService,
    private router: Router,
    private searchService: SearchService,
    private liveAnnouncer: LiveAnnouncer
  ) {}

  ngOnInit() {}

  ngOnChanges() {
    this.route.params.pipe(first()).subscribe(params => {});
  }

  annoucement(message: string, tone: AriaLivePoliteness) {
    this.liveAnnouncer
      .announce(message, tone)
      .then(x => x)
      .catch(e => console.error(e));
  }

  globalSearch(searchInput: string) {
    if (searchInput.length >= 1) {
      this.globalProblemSearchResults = [];
      this.userSearchResults = [];
      this.solutionSearchResults = [];

      this.searchService.globalSearch(searchInput).subscribe(
        searchData => {
          this.globalProblemSearchResults = searchData['problems'];
          this.userSearchResults = searchData['users'];
          this.solutionSearchResults = searchData['solutions'];

          this.annoucement(
            `Found
            ${this.globalProblemSearchResults.length} Problems,
            ${this.solutionSearchResults.length} Solutions,
            ${this.userSearchResults.length} Contributors`,
            'polite'
          );
        },
        error => {
          console.error(JSON.stringify(error));
        }
      );
    } else {
      this.globalProblemSearchResults = [];
      this.userSearchResults = [];
      this.solutionSearchResults = [];
    }
  }
}
