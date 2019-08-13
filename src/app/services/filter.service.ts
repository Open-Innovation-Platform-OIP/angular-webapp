import { Injectable } from "@angular/core";
import { TagsService } from "./tags.service";
import { GeocoderService } from "./geocoder.service";

@Injectable({
  providedIn: "root"
})
export class FilterService {
  sectorsArray = [];
  sectorFilterArray: any[] = [];
  sector_filter_query: string = ``;
  location_filter_query: string = ``;
  range: number = 0.2;
  queryVariable = {};
  location_filter_header: any = ``;
  selectedSectors: any[] = [];
  selectedLocation: any = "";

  constructor(
    private tagsService: TagsService,
    private geoService: GeocoderService
  ) {}

  filterSector(queryParams) {
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

  filterLocation(queryParams) {
    let coordinates;
    let parsedQuery;

    if (queryParams.filterLocation) {
      parsedQuery = JSON.parse(queryParams.filterLocation);

      coordinates = [parsedQuery.latitude, parsedQuery.longitude];

      console.log(coordinates, "cordinates");

      this.location_filter_query = `{problem_locations:{ location:{location: {_st_d_within: {distance: ${
        this.range
      }, from: $point}}}}}`;

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
      return {};
    }
  }
}
