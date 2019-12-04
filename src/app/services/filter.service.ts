import { Injectable } from '@angular/core';
import { TagsService } from './tags.service';
import { GeocoderService } from './geocoder.service';
import { Apollo } from 'apollo-angular';

import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  test = {
    data: {
      domains: [
        {
          domain_tags: [
            {
              tag: {
                id: 3
              }
            },
            {
              tag: {
                id: 4
              }
            }
          ]
        }
      ]
    }
  };
  sectorsArray = [];
  sectorFilterArray: any[] = [];
  sector_filter_query = `_nin:[0]`;
  location_filter_query = ``;
  solution_location_filter_query = ``;
  range = 0.2;
  queryVariable = {};
  location_filter_header: any = ``;
  selectedSectors: any[] = [];
  selectedLocation: any = '';
  is_domain_filter_mode = false;
  domain_tags_query = '';
  isPrimaryDomain: Boolean;

  constructor(
    private tagsService: TagsService,
    private geoService: GeocoderService,
    private apollo: Apollo
  ) {}

  filterSector(queryParams) {
    if (!this.is_domain_filter_mode) {
      if (
        !Object.keys(queryParams).filter(
          param => param !== 'filterLocation' && param !== 'locationRange'
        ).length
      ) {
        this.sector_filter_query = `_nin:[0]`;
        return [];
      } else {
        this.sectorsArray = Object.keys(queryParams).filter(
          param => param !== 'filterLocation' && param !== 'locationRange'
        );
        this.sectorFilterArray = this.sectorsArray.map(sector => {
          if (sector && this.tagsService.allTags[sector]) {
            return this.tagsService.allTags[sector].id;
          }
        });

        if (this.sectorFilterArray.length) {
          this.sector_filter_query = `_in:[${this.sectorFilterArray}]`;
        }

        return this.sectorsArray;
      }
    } else {
      if (
        Object.keys(queryParams).filter(
          param => param !== 'filterLocation' && param !== 'locationRange'
        ).length
      ) {
        this.sectorsArray = Object.keys(queryParams).filter(
          param => param !== 'filterLocation' && param !== 'locationRange'
        );
        this.sectorFilterArray = this.sectorsArray.map(sector => {
          if (sector && this.tagsService.allTags[sector]) {
            return this.tagsService.allTags[sector].id;
          }
        });

        if (this.sectorFilterArray.length) {
          this.sector_filter_query = `_in:[${this.sectorFilterArray}]`;
        }

        return this.sectorsArray;
      } else {
        return [];
      }
    }
  }

  async filterSectorByDomain(domain: string) {
    const sectorIdArray = [];

    this.apollo
      .watchQuery<any>({
        query: gql`
          {
            domains(where: { url: { _eq: "${domain}" } }) {
              is_primary
              domain_tags {
                tag {
                  id
                }
              }
            }
          }
        `
      })
      .valueChanges.subscribe(
        async ({ data }) => {
          if (data.domains[0].is_primary) {
            this.isPrimaryDomain = true;
          } else {
            this.isPrimaryDomain = false;
          }
          if (data.domains[0].domain_tags.length) {
            data.domains[0].domain_tags.map(tags => {
              if (tags && tags.tag) {
                sectorIdArray.push(tags.tag.id);
              }
            });

            this.is_domain_filter_mode = true;
            this.sector_filter_query = `_in:[${sectorIdArray}]`;
            this.domain_tags_query = `(where:{domain_tags:{domain:{url:{_eq:"${domain}"}}
        }})`;
          } else {
            this.is_domain_filter_mode = false;
            this.sector_filter_query = `_nin:[0]`;
            this.domain_tags_query = ``;
          }

          await this.tagsService.getTagsFromDB(this.domain_tags_query);
        },
        error => {
          console.error(JSON.stringify(error));
        }
      );
  }

  filterLocation(queryParams) {
    let coordinates;
    let parsedQuery;

    if (queryParams.filterLocation) {
      parsedQuery = JSON.parse(queryParams.filterLocation);

      coordinates = [parsedQuery.latitude, parsedQuery.longitude];

      if (
        parsedQuery.type === 'city' ||
        parsedQuery.type === 'state' ||
        parsedQuery.type === 'country'
      ) {
        this.location_filter_query = `{problem_locations:{_or:[{location:{location: {_st_d_within: {distance: ${
          this.range
        }, from: $point}}}},{location:{${parsedQuery.type}:{_eq:"${
          parsedQuery[parsedQuery.type]
        }"}}}]}}`;
        this.solution_location_filter_query = `{problems_solutions:{problem:{problem_locations:{_or:[{location:{location: {_st_d_within: {distance: ${
          this.range
        }, from: $point}}}},{location:{${parsedQuery.type}:{_eq:"${
          parsedQuery[parsedQuery.type]
        }"}}}]}}}}`;
      } else {
        this.location_filter_query = `{problem_locations:{ location:{location: {_st_d_within: {distance: ${this.range}, from: $point}}}}}`;
        this.solution_location_filter_query = `{problems_solutions:{problem:{problem_locations:{location:{location: {_st_d_within: {distance:${this.range}, from: $point}}}}}}}`;
      }

      this.queryVariable = {
        point: {
          type: 'Point',
          coordinates: coordinates
        }
      };

      this.location_filter_header = `($point:geometry!)`;

      return parsedQuery;
    } else {
      this.location_filter_query = ``;

      this.solution_location_filter_query = ``;
      return {};
    }
  }
}
