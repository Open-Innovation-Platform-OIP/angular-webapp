import { Injectable } from "@angular/core";
import { TagsService } from "./tags.service";
import { GeocoderService } from "./geocoder.service";
import { Apollo } from "apollo-angular";

import gql from "graphql-tag";

@Injectable({
  providedIn: "root"
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
  sector_filter_query: string = ``;
  location_filter_query: string = ``;
  solution_location_filter_query: string = ``;
  range: number = 0.2;
  queryVariable = {};
  location_filter_header: any = ``;
  selectedSectors: any[] = [];
  selectedLocation: any = "";
  is_domain_filter_mode: boolean = false;

  constructor(
    private tagsService: TagsService,
    private geoService: GeocoderService,
    private apollo: Apollo
  ) {}

  filterSector(queryParams) {
    if (!this.is_domain_filter_mode) {
      if (
        !Object.keys(queryParams).filter(
          param => param !== "filterLocation" && param !== "locationRange"
        ).length
      ) {
        this.sector_filter_query = `_nin:[0]`;
        return [];
      } else {
        this.sectorsArray = Object.keys(queryParams).filter(
          param => param !== "filterLocation" && param !== "locationRange"
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
        return this.sectorsArray;
      }
    }
  }

  filterSectorByDomain(domain: string) {
    let sectorIdArray = [];
    this.test.data.domains[0].domain_tags.map(tags => {
      sectorIdArray.push(tags.tag.id);
    });

    console.log(sectorIdArray, "sectorid array");
    if (sectorIdArray.length) {
      this.is_domain_filter_mode = true;
      this.sector_filter_query = `_in:[${sectorIdArray}]`;
    }

    console.log(this.sector_filter_query, "filter service sector filter query");
    // this.apollo
    //   .watchQuery<any>({
    //     query: gql`
    //               {
    //                   domains(where: { url: { _eq: ${domain} } }) {
    //                     domain_tags{
    //                       tag{
    //                         id
    //                       }
    //                     }

    //                   }

    //               }
    //               `
    //   })
    //   .valueChanges.subscribe(
    //     result => {
    //       console.log(result, " domain filter result");
    //     },
    //     error => {
    //       console.error(JSON.stringify(error));
    //     }
    //   );
  }

  filterLocation(queryParams) {
    let coordinates;
    let parsedQuery;

    if (queryParams.filterLocation) {
      parsedQuery = JSON.parse(queryParams.filterLocation);

      coordinates = [parsedQuery.latitude, parsedQuery.longitude];

      console.log(coordinates, "cordinates");

      this.location_filter_query = `{problem_locations:{ location:{location: {_st_d_within: {distance: ${this.range}, from: $point}}}}}`;
      this.solution_location_filter_query = `{problems_solutions:{problem:{problem_locations:{location:{location: {_st_d_within: {distance:${this.range}, from: $point}}}}}}}`;
      this.queryVariable = {
        point: {
          type: "Point",
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
      this.solution_location_filter_query = ``;
      return {};
    }
  }
}
