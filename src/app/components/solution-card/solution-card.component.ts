import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-solution-card",
  templateUrl: "./solution-card.component.html",
  styleUrls: ["./solution-card.component.css"]
})
export class SolutionCardComponent implements OnInit {
  @Input() solutionData: any;

  numOfVotes: Number = 0;
  numOfWatchers: Number = 0;
  numOfValidations: Number = 0;
  validated: Boolean = false;
  link = "";

  constructor() {}

  ngOnInit() {
    if (this.solutionData.is_draft) {
      this.link += `/solutions/${this.solutionData.id}/edit`;
    } else {
      this.link += `/solutions/${this.solutionData.id}`;
    }
    // console.log("Solution Data", this.solutionData);
    // this.link += `/solutions/${this.solutionData.id}`;

    if (
      this.solutionData.solution_voters &&
      this.solutionData.solution_voters.length
    ) {
      this.numOfVotes = this.solutionData.solution_voters.length;
    }
    if (
      this.solutionData.solution_watchers &&
      this.solutionData.solution_watchers.length
    ) {
      this.numOfWatchers = this.solutionData.solution_watchers.length;
    }
    if (
      this.solutionData.solution_validations &&
      this.solutionData.solution_validations.length
    ) {
      this.numOfValidations = this.solutionData.solution_validations.length;
      this.validated = true;
    }
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
