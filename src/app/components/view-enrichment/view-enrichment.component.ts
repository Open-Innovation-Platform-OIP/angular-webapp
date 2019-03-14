import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter
} from "@angular/core";
import { ProblemService } from "../../services/problem-handle.service";

import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-view-enrichment",
  templateUrl: "./view-enrichment.component.html",
  styleUrls: ["./view-enrichment.component.css"]
})
export class ViewEnrichmentComponent implements OnInit, OnChanges {
  @Output() editClicked = new EventEmitter();
  @Output() voteClicked = new EventEmitter();
  @Output() deleteClicked = new EventEmitter();

  @Input() enrichmentData: any;
  enrichmentVoted = false;
  numberOfVotes: number;
  showModal = false;
  combinedImgAndVideo: any[] = [];
  index = 0;
  videoStatus = false;
  modalSrc: String;

  constructor(
    private problemService: ProblemService,
    private auth: AuthService
  ) {
    console.log("aswewrwe");
  }

  ngOnInit() {
    this.combinedImgAndVideo = [
      ...this.enrichmentData.image_urls,
      ...this.enrichmentData.video_urls
    ];
    console.log(this.enrichmentData, "test enrich view");
    if (this.enrichmentData.voted_by) {
      this.enrichmentData.voted_by.forEach(userId => {
        if (Number(userId) === Number(this.auth.currentUserValue.id)) {
          // console.log(userId, "userId");
          this.enrichmentVoted = true;
        }
      });
      this.numberOfVotes = this.enrichmentData.voted_by.length;
    }

    // this.numberOfVotes = Object.keys(this.enrichmentData.voted_by).length;
    // if (this.enrichmentData.voted_by.abc123) {
    //   this.enrichmentVoted = true;
    // }
  }
  ngOnChanges() {
    // console.log(this.enrichmentData, 'works');
  }

  voteEnrichment() {
    this.enrichmentVoted = !this.enrichmentVoted;
    console.log("clicked");
    if (this.enrichmentVoted) {
      this.numberOfVotes++;

      this.enrichmentData.voted_by.push(Number(this.auth.currentUserValue.id));
      this.enrichmentData.voted_by = JSON.stringify(
        this.enrichmentData.voted_by
      )
        .replace("[", "{")
        .replace("]", "}");

      this.voteClicked.emit(this.enrichmentData);
      this.enrichmentData.voted_by = JSON.parse(
        this.enrichmentData.voted_by.replace("{", "[").replace("}", "]")
      );
    } else {
      this.numberOfVotes--;
      let index = this.enrichmentData.voted_by.indexOf(
        Number(this.auth.currentUserValue.id)
      );
      this.enrichmentData.voted_by.splice(index, 1);
      this.enrichmentData.voted_by = JSON.stringify(
        this.enrichmentData.voted_by
      )
        .replace("[", "{")
        .replace("]", "}");

      this.voteClicked.emit(this.enrichmentData);
      this.enrichmentData.voted_by = JSON.parse(
        this.enrichmentData.voted_by.replace("{", "[").replace("}", "]")
      );
    }
  }

  toggleViewForImgNView() {
    this.modalSrc = this.combinedImgAndVideo[0].url;
    this.videoStatus = false;
    this.index = 0;
    this.showModal = true;
  }

  toggleSrc(btn: String) {
    if (btn === "next" && this.index < this.combinedImgAndVideo.length - 1) {
      this.index++;
      const url = this.combinedImgAndVideo[this.index].url;

      if (url.substr(-4) === ".mp4") {
        this.videoStatus = true;
      } else {
        this.videoStatus = false;
      }
      this.modalSrc = url;
    }

    if (btn === "prev" && this.index > 0) {
      this.index--;
      const url = this.combinedImgAndVideo[this.index].url;

      if (url.substr(-4) === ".mp4") {
        this.videoStatus = true;
      } else {
        this.videoStatus = false;
      }
      this.modalSrc = url;
    }
  }

  editEnrichment() {
    console.log("edit clicked");
    this.editClicked.emit(this.enrichmentData);
  }

  deleteEnrichment() {
    this.deleteClicked.emit(this.enrichmentData.id);
    // this.enrichmentHandlerService.deleteEnrichment(this.enrichmentData.id);
  }
}
