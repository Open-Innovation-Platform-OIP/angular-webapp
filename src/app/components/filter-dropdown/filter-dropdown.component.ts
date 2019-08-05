import { Component, OnInit, Input, OnChanges } from "@angular/core";
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
  @Input() type: string;
  selectedSectors: any = [];
  selectedLocation: any = "";
  range: any;

  ranges = {
    0: "0 Kms",
    25: "25 kms",
    50: "50 kms",
    100: "100 kms",
    200: "200 kms"
  };

  sectors: any = {};
  locations: any = {};
  objectValues = Object.values;
  objectKeys = Object.keys;

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

    this.activatedRoute.queryParams.subscribe(params => {
      console.log(params, "params in dropdown");
      this.selectedSectors = this.filterService.filterSector(params);
      this.selectedLocation = this.filterService.filterLocation(params);
      if (params.locationRange) {
        console.log(typeof params.locationRange, "location range");
        this.range = Math.round(+params.locationRange * 110).toString();
        this.filterService.range = +params.locationRange;
      } else {
        this.range = "0";
      }
    });
    // this.selectedLocation = this.filterService.selectedLocation;
    // this.selectedSectors = this.filterService.selectedSectors;
  }

  selectDropdown(event) {
    console.log(this.range, "range");
    let queries = {};
    if (+this.range !== 0) {
      this.filterService.range = +this.range / 110;
      queries["locationRange"] = this.filterService.range;
    } else {
      this.filterService.range = 0.2;
    }

    this.selectedSectors.map(sector => {
      queries[sector] = "sectorFilter";
    });

    if (!this.selectedLocation) {
      if (queries["locationRange"]) {
        delete queries["locationRange"];
      }
      this.router.navigate(["/" + this.type], {
        queryParams: queries
      });
      return;
    }

    if (this.selectedLocation) {
      queries["filterLocation"] = this.selectedLocation;
    }

    this.router.navigate(["/" + this.type], {
      queryParams: queries
    });
  }
}
