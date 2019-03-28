import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-enrichment-card",
  templateUrl: "./enrichment-card.component.html",
  styleUrls: ["./enrichment-card.component.css"]
})
export class EnrichmentCardComponent implements OnInit {
  @Input() enrichmentData: any;
  @Output() clicked = new EventEmitter();
  numberOfVotes: any = 0;

  constructor() { }

  ngOnInit() {
    if (this.enrichmentData && this.enrichmentData.voted_by) {
      this.numberOfVotes = this.enrichmentData.voted_by.length;
    }
    // console.log(this.enrichmentData, "enrichment app card");
  }
  cardClicked() {
    console.log("card clicked");
    this.clicked.emit(this.enrichmentData);
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
