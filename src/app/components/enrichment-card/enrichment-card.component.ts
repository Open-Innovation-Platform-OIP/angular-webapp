import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-enrichment-card",
  templateUrl: "./enrichment-card.component.html",
  styleUrls: ["./enrichment-card.component.css"]
})
export class EnrichmentCardComponent implements OnInit {
  @Input() enrichmentData: any;
  @Output() clicked = new EventEmitter();
  numberOfVotes: any = 0;
  voters = new Set();

  constructor(private auth: AuthService) {}

  ngOnInit() {
    // if (this.enrichmentData && this.enrichmentData.voted_by) {
    //   this.numberOfVotes = this.enrichmentData.voted_by.length;
    // }
    this.enrichmentData.enrichment_voters.map(voter => {
      this.voters.add(voter.user_id);
    });
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
