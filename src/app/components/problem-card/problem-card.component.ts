import { Component, OnInit, Input } from "@angular/core";
const misc: any = {
  navbar_menu_visible: 0,
  active_collapse: true,
  disabled_collapse_init: 0
};

@Component({
  selector: "app-problem-card",
  templateUrl: "./problem-card.component.html",
  styleUrls: ["./problem-card.component.css"]
})
export class ProblemCardComponent implements OnInit {
  @Input() problemData: any;
  votedBy: any;
  watchedBy: any;
  validatedBy: any;
  // modifiedAt: any;
  // sectors: any[] = [];
  constructor() { }

  ngOnInit() {
    console.log("problem card", this.problemData);
    if (this.problemData.voted_by && this.problemData.voted_by.length) {
      this.votedBy = this.problemData.voted_by.length;
    }
    if (this.problemData.watched_by && this.problemData.watched_by.length) {
      this.watchedBy = this.problemData.watched_by.length;
    }
    if (
      this.problemData.validatedBy &&
      this.problemData.validatedBy.length
    ) {
      this.validatedBy = this.problemData.problem_validations.length;
    }

    // this.sectors = Object.keys(this.problemData.sectors).filter((sector) => {
    //   if (this.problemData.sectors[sector]) {
    //     return sector;
    //   };
    // })
  }
}
