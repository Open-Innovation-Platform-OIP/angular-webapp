import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { EnrichmentService } from '../services/enrichment.service';
import { map, startWith } from 'rxjs/operators';
import { first } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { take } from 'rxjs/operators';
import { GeocoderService } from '../services/geocoder.service';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';

@Component({
  selector: 'app-enrichment-form',
  templateUrl: './enrichment-form.component.html',
  styleUrls: ['./enrichment-form.component.css']
})
export class EnrichmentFormComponent implements OnInit, OnDestroy {
  @ViewChild('cardHeading') cardHeader: ElementRef<HTMLElement>;
  private problemId: Number;
  public problemData: any;
  enrichmentLocations: any = [];
  public enrichmentData: any = {
    user_id: '',

    description: '',

    organization: '',
    resources_needed: '',
    image_urls: [],
    video_urls: [],
    impact: '',
    min_population: 0,
    max_population: '',
    extent: '',
    beneficiary_attributes: '',

    featured_url: '',
    embed_urls: [],
    featured_type: '',
    attachments: []
  };
  submitEnrichmentSub: Subscription;
  moveFocusBack = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private enrichmentService: EnrichmentService,
    private apollo: Apollo,
    private geoService: GeocoderService,
    private router: Router,
    private elementRef: ElementRef,
    private focusMonitor: FocusMonitor
  ) {}

  ngOnInit() {
    this.problemId = Number(this.route.snapshot.paramMap.get('problemId'));

    if (this.problemId) {
      this.apollo
        .watchQuery<any>({
          query: gql`
                    {
                        problems(where: { id: { _eq: ${this.problemId} } }) {
                        
                        
                        id
                        title
                        user_id
                        description
                        
                        resources_needed
                        problem_locations{
                          location{
                            id
                            location_name
                            location
                            lat
                            long
                          }
                        }
                        image_urls
                        video_urls
                        impact
                        extent
                        min_population
                        max_population
                        beneficiary_attributes
                        organization
                        featured_url
                        featured_type
                        embed_urls
                        
                        user {
                          id
                          name
                        }
                        problems_tags{
                          tag {
                              id
                              name
                          }
                      }

                        
                       
                        }
                    }
                    `
        })
        .valueChanges.pipe(take(1))
        .subscribe(
          result => {
            if (
              result.data.problems.length >= 1 &&
              result.data.problems[0].id
            ) {
              this.problemData = result.data.problems[0];
            }
          },
          err => {
            console.error('error', err);
            console.error(JSON.stringify(err));
          }
        );
    }

    this.route.params.pipe(first()).subscribe(params => {
      if (params.id) {
        this.apollo
          .watchQuery<any>({
            query: gql`
                        {
                            enrichments(where: { id: { _eq: ${params.id} } }) {
                            
                            
                            id
                            
                            user_id
                            description
                            
                            resources_needed
                            image_urls
                            video_urls
                            attachments
                            impact
                            extent
                            attachments
                            min_population
                            max_population
                            beneficiary_attributes
                            organization
                            featured_url
                            featured_type
                            embed_urls

                            enrichment_locations{
                              location{
                                id
                                location_name
                                location
                                lat
                                long
                              }
                            }
                            
                            problem{
                              id
                              title
                              user_id
                              description
                              
                              problem_locations{
                                location{
                                  id
                                location_name
                                location
                                lat
                                long
                                }
                              }
                              
                              resources_needed
                              image_urls
                              video_urls
                              impact
                              extent
                              min_population
                              max_population
                              beneficiary_attributes
                              organization
                              featured_url
                              featured_type
                              embed_urls
                             
                              user {
                                id
                                name
                              }
                              problems_tags{
                                tag {
                                    id
                                    name
                                }
                            }

                            }
                           

                            
                           
                            }
                        }
                        `,
            fetchPolicy: 'network-only'
          })
          .valueChanges.pipe(take(1))
          .subscribe(
            result => {
              if (
                result.data.enrichments.length >= 1 &&
                result.data.enrichments[0].id
              ) {
                this.enrichmentData['id'] = result.data.enrichments[0].id;
                Object.keys(this.enrichmentData).map(key => {
                  if (result.data.enrichments[0][key]) {
                    this.enrichmentData[key] = result.data.enrichments[0][key];
                  }
                });

                if (result.data.enrichments[0].enrichment_locations) {
                  this.enrichmentLocations = result.data.enrichments[0].enrichment_locations.map(
                    locations => {
                      if (locations.location.__typename) {
                        delete locations.location.__typename;
                        return locations.location;
                      }
                    }
                  );
                }

                this.problemData =
                  result.data.enrichments[0].problemsByproblemId;
              }
            },
            err => {
              console.error('error', err);
              console.error(JSON.stringify(err));
            }
          );
      }
    });
  }

  addLocation(locations) {
    this.enrichmentLocations = locations;
  }

  removeLocation(removedLocation) {
    this.enrichmentLocations = this.enrichmentLocations.filter(location => {
      if (location.location_name !== removedLocation.location_name) {
        return location;
      }
    });

    if (
      this.geoService.allLocations[removedLocation.location_name] &&
      this.enrichmentData['id']
    ) {
      this.geoService.removeLocationRelation(
        removedLocation.id,
        this.enrichmentData['id'],
        'enrichments'
      );
    } else if (removedLocation.id) {
      this.geoService.removeLocationRelation(
        removedLocation.id,
        this.enrichmentData['id'],
        'enrichments'
      );
    }
  }

  onEnrichmentSubmit(enrichmentData) {
    if (enrichmentData.__typename) {
      delete enrichmentData.__typename;
    }
    enrichmentData.user_id = Number(this.auth.currentUserValue.id);

    enrichmentData.problem_id = this.problemId;

    this.submitEnrichmentSub = this.apollo
      .mutate({
        mutation: gql`
          mutation upsert_enrichments(
            $enrichments: [enrichments_insert_input!]!
          ) {
            insert_enrichments(
              objects: $enrichments
              on_conflict: {
                constraint: enrichments_pkey
                update_columns: [
                  description
                  organization
                  resources_needed
                  image_urls
                  video_urls
                  impact
                  min_population
                  max_population
                  extent
                  beneficiary_attributes
                  featured_url
                  featured_type
                  embed_urls
                  attachments
                ]
              }
            ) {
              affected_rows
              returning {
                id
                problem_id
                solution_id
              }
            }
          }
        `,
        variables: {
          enrichments: [enrichmentData]
        }
      })
      .subscribe(
        data => {
          let enrichmentId = data.data.insert_enrichments.returning[0].id;

          const enrichment_locations = new Set();
          this.enrichmentLocations.map(location => {
            if (
              this.geoService.allLocations[location.location_name] &&
              this.geoService.allLocations[location.location_name].id
            ) {
              enrichment_locations.add({
                location_id: this.geoService.allLocations[
                  location.location_name
                ].id,
                enrichment_id: enrichmentId
              });
            }
          });

          if (enrichment_locations.size > 0) {
            this.geoService.addRelationToLocations(
              enrichmentId,
              enrichment_locations,
              'enrichments'
            );
          }

          if (this.enrichmentLocations) {
            this.geoService.addLocationsInDB(
              this.enrichmentLocations,
              'enrichments',
              enrichmentId
            );
          }

          swal({
            type: 'success',
            title: 'Thank you for enriching!',
            timer: 4000,
            showConfirmButton: false
          }).catch(swal.noop);

          this.router.navigate(
            ['problems', data.data.insert_enrichments.returning[0].problem_id],
            { queryParamsHandling: 'preserve' }
          );
          this.submitEnrichmentSub.unsubscribe();
        },
        err => {
          console.error(err, 'error');
          console.error(JSON.stringify(err));
          this.submitEnrichmentSub.unsubscribe();

          swal({
            title: 'Error',
            text: 'Try Again',
            type: 'error',
            confirmButtonClass: 'btn btn-info',
            buttonsStyling: false
          }).catch(swal.noop);
        }
      );
    // }
  }

  ngOnDestroy() {
    this.focusMonitor.stopMonitoring(this.cardHeader);
  }

  focusToProblemDetails(status: boolean) {
    if (status) {
      this.moveFocusToCardHeading();
      this.moveFocusBack = false;
    }
  }

  moveFocusToCardHeading() {
    this.focusMonitor.focusVia(this.cardHeader, 'program');
  }

  revertFocus() {
    this.moveFocusBack = true;
  }
}
