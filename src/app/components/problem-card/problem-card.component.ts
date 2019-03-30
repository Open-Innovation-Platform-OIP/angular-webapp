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
  numOfVotes: Number = 0;
  numOfWatchers: Number = 0;
  numOfValidations: Number = 0;
  validated: Boolean = false;
  // modifiedAt: any;
  // sectors: any[] = [];

  constructor() {}

  ngOnInit() {
    // console.log("problem card", this.problemData);
    if (
      this.problemData.problem_voters &&
      this.problemData.problem_voters.length
    ) {
      this.numOfVotes = this.problemData.problem_voters.length;
    }
    if (
      this.problemData.problem_watchers &&
      this.problemData.problem_watchers.length
    ) {
      this.numOfWatchers = this.problemData.problem_watchers.length;
    }
    if (
      this.problemData.problem_validations &&
      this.problemData.problem_validations.length
    ) {
      this.numOfValidations = this.problemData.problem_validations.length;
      this.validated = true;
    }

    // this.sectors = Object.keys(this.problemData.sectors).filter((sector) => {
    //   if (this.problemData.sectors[sector]) {
    //     return sector;
    //   };
    // })
  }

  checkUrlIsImg(url) {
    var arr = ["jpeg", "jpg", "gif", "png"];
    var ext = url.substring(url.lastIndexOf(".") + 1);
    if (arr.indexOf(ext) > -1) {
      return true;
    } else {
      return false;
    }
  }
}
