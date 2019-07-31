import { Component, OnInit, Input } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { TagsService } from "../../services/tags.service";
// import { take } from "rxjs/operators";
import { GeocoderService } from "../../services/geocoder.service";
import { FilterService } from "../../services/filter.service";

@Component({
  selector: "app-filter-dropdown",
  templateUrl: "./filter-dropdown.component.html",
  styleUrls: ["./filter-dropdown.component.css"]
})
export class FilterDropdownComponent implements OnInit {
  selectedSectors: any = [];
  @Input() type: string;
  selectedLocation: any = "";
  // selected: any;

  sectors: any = {};
  locations: any = {};
  objectValues = Object.values;
  // queryParams: any = {};

  constructor(
    private tagsService: TagsService,
    private router: Router,
    private geoService: GeocoderService,
    private activatedRoute: ActivatedRoute,
    private filterService: FilterService
  ) {}

  ngOnInit() {
    this.sectors = this.tagsService.allTags;
    this.locations = this.geoService.allLocations;
    this.selectedLocation = this.filterService.selectedLocation;
    this.selectedSectors = this.filterService.selectedSectors;
  }

  selectDropdown(event) {
    let queries = {};

    // if (this.selectedSectors.length) {
    //   this.selectedSectors.map(sectorName => {
    //     sectorFilter[sectorName] = "filter";
    //     // this.tagsService.sectorFilterArray.push()
    //   });
    // }

    this.selectedSectors.map(sector => {
      queries[sector] = "filter";
    });
    console.log(this.selectedLocation, "selectedLocation");
    if (this.selectedLocation === "") {
      this.filterService.selectedLocation = "";
      console.log(queries, "queries");
      this.router.navigate(["/" + this.type], {
        queryParams: queries
      });
      return;
    }
    queries["filterLocation"] = this.selectedLocation;

    // console.log(queries, "queries");
    this.router.navigate(["/" + this.type], {
      queryParams: queries
    });
  }

  // selectLocation() {
  //   const locationFilter = {};

  //   // if (this.selectedLocations.length) {
  //   //   this.selectedLocations.map(locationName => {
  //   //     locationFilter["filterLocation"] = ;
  //   //     // this.tagsService.sectorFilterArray.push()
  //   //   });
  //   console.log(this.selectedLocation, "selected location =====");
  //   // }
  //   locationFilter["filterLocation"] = this.selectedLocation;
  //   console.log(locationFilter, "location filter");
  //   // this.lothis.selectLocation

  //   this.router.navigate(["/" + this.type], {
  //     queryParams: locationFilter,
  //     queryParamsHandling: "merge"
  //   });
  // }
}
