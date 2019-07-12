import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { TagsService } from "../../services/tags.service";
// import { take } from "rxjs/operators";
// import { FilterService } from "../../services/filter.service";

@Component({
  selector: "app-filter-dropdown",
  templateUrl: "./filter-dropdown.component.html",
  styleUrls: ["./filter-dropdown.component.css"]
})
export class FilterDropdownComponent implements OnInit {
  @Input() selectedSectors: any = [];
  @Input() type: string;

  sectors: any = {};
  objectValues = Object.values;

  constructor(private tagsService: TagsService, private router: Router) {}

  ngOnInit() {
    this.sectors = this.tagsService.allTags;
  }

  selectSector() {
    // let sectorFilterObject = {};
    const sectorFilter = {};

    console.log(this.selectedSectors, "sector filter");

    if (this.selectedSectors.length) {
      this.selectedSectors.map(sectorName => {
        sectorFilter[sectorName] = this.tagsService.allTags[sectorName].id;
        // this.tagsService.sectorFilterArray.push()
      });
    }

    this.router.navigate(["/" + this.type], {
      queryParams: sectorFilter
    });
  }
}
