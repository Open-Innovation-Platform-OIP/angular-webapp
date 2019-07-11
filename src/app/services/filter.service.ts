import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class FilterService {
  sectorFilterArray: any[] = [];
  sector_filter_query: string = ``;

  constructor() {}

  filterSector(queryParams) {
    if (!Object.keys(queryParams).length) {
      this.sector_filter_query = `_nin:[0]`;
      return [];
    } else {
      this.sectorFilterArray = Object.values(queryParams).map(String);
      console.log(this.sectorFilterArray, "tag array");
      this.sector_filter_query = `_in:[${this.sectorFilterArray}]`;
      return Object.keys(queryParams);
    }
  }
}
