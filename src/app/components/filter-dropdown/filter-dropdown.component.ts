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
  selectedLocation: any = {};
  range: any;
  selectedLocationName: string = "";

  ranges = {
    0: "0 Kms",
    25: "25 kms",
    50: "50 kms",
    100: "100 kms",
    200: "200 kms"
  };

  sectors: any = {};
  locations: any = [];
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
    // this.locations = this.geoService.allLocations;

    this.activatedRoute.queryParams.subscribe(params => {
      console.log(params, "params in dropdown");
      this.selectedSectors = this.filterService.filterSector(params);
      // this.selectedLocationName = this.filterService.filterLocation(params).location_name;
      this.selectedLocation = this.filterService.filterLocation(params);
      if (Object.values(this.selectedLocation).length) {
        this.selectedLocationName = this.selectedLocation.location_name;
      }
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

  getLocation(input) {
    // console.log(input, "input tag");
    this.geoService.getAddress(this.selectedLocationName).then(
      result => {
        this.locations = <Array<any>>result;
      },
      error => {
        console.error(error);
      }
    );

    // var obj = personas;
    // console.log(personas);
    // var keys = Object.keys(obj);

    // var filtered = keys.filter(function(key) {
    //   return obj[key];
    // });
    // console.log(JSON.parse("{" + filtered.toString() + "}"));
    // console.log(typeof JSON.parse("{" + filtered.toString() + "}"));
  }

  selectDropdown(event) {
    if (
      event &&
      event.option &&
      event.option.value &&
      event.option.value.Address
    ) {
      this.selectedLocationName = event.option.value.Address.Label;
      this.selectedLocation = {
        location_name: event.option.value.Address.Label,
        latitude: event.option.value.DisplayPosition.Latitude,
        longitude: event.option.value.DisplayPosition.Longitude
      };
    }

    if (!this.selectedLocationName) {
      this.selectedLocation = {};
    }

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

    if (!Object.values(this.selectedLocation).length) {
      if (queries["locationRange"]) {
        delete queries["locationRange"];
      }
      this.router.navigate(["/" + this.type], {
        queryParams: queries
      });
      return;
    }

    if (Object.values(this.selectedLocation).length) {
      queries["filterLocation"] = JSON.stringify(this.selectedLocation);
    }

    console.log(queries, "queries");

    this.router.navigate(["/" + this.type], {
      queryParams: queries
    });
  }
}
