import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-solution-card",
  templateUrl: "./solution-card.component.html",
  styleUrls: ["./solution-card.component.css"]
})
export class SolutionCardComponent implements OnInit {
  @Input() solutionData: any;

  validated: Boolean = false;
  link = "";

  constructor() {}

  ngOnInit() {
    console.log("Solution Data", this.solutionData);
    this.link += `/solutions/${this.solutionData.id}`;
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
