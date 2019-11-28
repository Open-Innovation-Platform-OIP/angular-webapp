import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SearchService } from '../services/search.service';
import { take } from 'rxjs/operators';
import { LiveAnnouncer, AriaLivePoliteness } from '@angular/cdk/a11y';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit, OnDestroy {
  landingPageSearchResults = [];
  searchInput: any;
  problems: any;
  numberToBeShown: Number;

  // getProblemsSub: Subscription;

  constructor(
    private apollo: Apollo,
    private route: ActivatedRoute,
    private router: Router,
    private ngxService: NgxUiLoaderService,
    private searchService: SearchService,
    private liveAnnouncer: LiveAnnouncer
  ) {}

  ngOnInit() {
    this.numberToBeShown = 4;
    this.apollo
      .watchQuery<any>({
        query: gql`
          query PostsGetQuery {
            problems(
              where: { is_draft: { _eq: false } }

              order_by: { updated_at: desc }
            ) {
              id
              title
              description

              resources_needed
              image_urls
              edited_at
              updated_at

              featured_url

              problem_locations {
                location {
                  id
                  location_name
                  location
                  lat
                  long
                }
              }

              is_deleted
              problem_voters {
                problem_id
                user_id
              }
              problem_watchers {
                problem_id
                user_id
              }
              problem_validations {
                user_id
                comment
                agree
                created_at
                files
                user_id
                edited_at
                is_deleted
                problem_id
              }
              problem_collaborators {
                user_id
                problem_id
                edited_at
              }
            }
          }
        `,

        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(take(1))
      .subscribe(
        result => {
          if (result.data.problems.length > 0) {
            this.problems = result.data.problems;
          }
        },
        error => {
          console.error(JSON.stringify(error));
        }
      );
  }

  getNavHeight(): number {
    return document.querySelector('nav').clientHeight;
  }

  announcement(message: string, politeness?: AriaLivePoliteness) {
    this.liveAnnouncer
      .announce(message, politeness)
      .then(x => x)
      .catch(e => console.error(e));
  }

  showAll() {
    this.ngxService.start();

    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop();
    }, 2000);

    this.numberToBeShown = Number.MAX_SAFE_INTEGER;
  }

  landingPageSearch(searchInput: string) {
    // this.numberToBeShown = 8;
    if (this.searchInput.length < 2) {
      this.numberToBeShown = 4;
    }
    if (searchInput.length >= 3) {
      this.numberToBeShown = 8;

      this.landingPageSearchResults = [];

      this.searchService.problemSearch(searchInput).subscribe(
        value => {
          this.landingPageSearchResults = value.data.search_problems_multiword;
          let num = this.landingPageSearchResults.length;
          this.announcement(`Found ${num} ${num > 1 ? 'results' : 'result'}`);
        },
        error => {
          console.error(JSON.stringify(error));
        }
      );
    } else {
      this.landingPageSearchResults = [];
    }
  }
  ngOnDestroy() {
    // this.getProblemsSub.unsubscribe();
  }
}
