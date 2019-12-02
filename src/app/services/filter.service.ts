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
  sector_filter_query: string = `_nin:[0]`;
  location_filter_query: string = ``;
  solution_location_filter_query: string = ``;
  range: number = 0.2;
  queryVariable = {};
  location_filter_header: any = ``;
  selectedSectors: any[] = [];
  selectedLocation: any = '';
  is_domain_filter_mode: boolean = false;
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

        // console.log(this.sectorFilterArray, "tag array");
        if (this.sectorFilterArray.length) {
          this.sector_filter_query = `_in:[${this.sectorFilterArray}]`;
        }
        // console.log(
        //   this.sector_filter_query,
        //   '=== test for sector filter query'
        // );
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

        // console.log(this.sectorFilterArray, "tag array");
        if (this.sectorFilterArray.length) {
          this.sector_filter_query = `_in:[${this.sectorFilterArray}]`;
        }
        // console.log(
        //   this.sector_filter_query,
        //   '=== test for sector filter query'
        // );
        return this.sectorsArray;
      } else {
        return [];
      }
    }
  }

  async filterSectorByDomain(domain: string) {
    let sectorIdArray = [];

    console.log(this.sector_filter_query, 'filter service sector filter query');
    await this.apollo
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
        ({ data }) => {
          console.log(data, ' domain filter result');
          if (data.domains[0].is_primary) {
            this.isPrimaryDomain = true;
          } else {
            this.isPrimaryDomain = false;
          }
          data.domains[0].domain_tags.map(tags => {
            sectorIdArray.push(tags.tag.id);
          });

          console.log(sectorIdArray, 'sector id array');

          this.is_domain_filter_mode = true;
          this.sector_filter_query = `_in:[${sectorIdArray}]`;
          this.domain_tags_query = `(where:{domain_tags:{domain:{url:{_eq:"${domain}"}}
        }})`;
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

      console.log(parsedQuery, 'parsed query');

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

      // this.queryVariable = {
      //   point: {
      //     type: "Point",
      //     coordinates: [12.2, 17.12]
      //   }
      // };

      this.location_filter_header = `($point:geometry!)`;

      return parsedQuery;
    } else {
      this.location_filter_query = ``;
      // console.log(location)
      this.solution_location_filter_query = ``;
      return {};
    }
  }
}
