import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

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
  @Input() usedIn: String;
  @Output() selected = new EventEmitter();

  numOfVotes: Number = 0;
  numOfWatchers: Number = 0;
  numOfValidations: Number = 0;
  validated: Boolean = false;
  link = "";
  // modifiedAt: any;
  // sectors: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // console.log("problem card", this.problemData);
    console.log(this.usedIn, "used");
    if (this.problemData.is_draft) {
      this.link += `/problems/${this.problemData.id}/edit`;
    } else {
      this.link += `/problems/${this.problemData.id}`;
    }
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
  navigation() {
    if (this.usedIn !== "smartSearch") {
      this.router.navigate([this.link]);
    } else {
      window.open(this.link, "_blank");
    }
  }
  selectProblem() {
    this.selected.emit({
      id: this.problemData.id,
      title: this.problemData.title
    });
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
