import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { TagsService } from '../../services/tags.service';
import { take, switchMap } from 'rxjs/operators';
import { FilterService } from '../../services/filter.service';
import { GeocoderService } from 'src/app/services/geocoder.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FocusMonitor } from '@angular/cdk/a11y';

@Component({
  selector: 'app-problems-view',
  templateUrl: './problems-view.component.html',
  styleUrls: ['./problems-view.component.css']
})
export class ProblemsViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('problemWorthSolving') problemWorthSolving: ElementRef;

  userProblems = [];
  problems = [];
  file_types = [
    'application/msword',
    ' application/vnd.ms-excel',
    ' application/vnd.ms-powerpoint',
    'text/plain',
    ' application/pdf',
    ' image/*',
    'video/*'
  ];
  userProblemViewQuery: QueryRef<any>;
  userProblemViewSubscription: Subscription;
  problemViewQuery: QueryRef<any>;
  problemViewSubscription: any;
  constructor(
    private apollo: Apollo,
    public auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private tagsService: TagsService,
    private filterService: FilterService,
    private route: ActivatedRoute,
    private geoService: GeocoderService,
    private http: HttpClient,
    private focusMonitor: FocusMonitor
  ) {
    this.tagsService
      .getTagsFromDB(this.filterService.domain_tags_query)
      .then(result => {
        return this.geoService.getLocationsFromDB();
      })
      .then(result => {
        this.getProblems();
      })
      .catch(err => console.error(err, 'error'));
  }

  ngOnInit() {
    this.getProblems();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.focusMonitor.focusVia(this.problemWorthSolving, 'program');
    }, 1000);
  }

  getProblems() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.filterService.selectedSectors = this.filterService.filterSector(
        params
      );
      this.filterService.selectedLocation = this.filterService.filterLocation(
        params
      );

      this.problemViewQuery = this.apollo.watchQuery<any>({
        query: gql`
          query table${this.filterService.location_filter_header}{
            problems(where:{is_draft: { _eq: false },_and:[{problems_tags:{tag_id:{${this.filterService.sector_filter_query}}}},${this.filterService.location_filter_query}]}order_by: {  updated_at: desc } )


            {
            id
            title
            description
            resources_needed
            image_urls
            edited_at
            updated_at
            featured_url
            is_deleted
            problem_voters {
              problem_id
              user_id
            }
            problem_watchers {
              problem_id
              user_id
            }
            problem_locations{
              location{
                id
                location_name
                lat
                long
              }
            }
            problem_locations{
              location{
                location_name
                id
              }
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
        variables: this.filterService.queryVariable,
        pollInterval: 500,
        fetchPolicy: 'network-only'
      });

      this.problemViewSubscription = this.route.paramMap.pipe(
        switchMap((routeParams: ParamMap) => {
          return this.problemViewQuery.valueChanges;
        })
      );

      this.problemViewSubscription.subscribe(
        result => {
          if (result.data.problems.length > 0) {
            this.problems = result.data.problems;
          } else {
            this.problems = [];
          }
        },
        error => {
          console.error(JSON.stringify(error));
        }
      );
    });
  }

  ngOnDestroy() {
    this.problemViewQuery.stopPolling();
    this.problemViewSubscription.unsubscribe();
  }
}
