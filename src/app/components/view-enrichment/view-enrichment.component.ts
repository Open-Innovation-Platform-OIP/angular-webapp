import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter
} from "@angular/core";
import { ProblemHandleService } from '../../services/problem-handle.service';
import { EnrichmentHandlerService } from '../../services/enrichment-handler.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: "app-view-enrichment",
  templateUrl: "./view-enrichment.component.html",
  styleUrls: ["./view-enrichment.component.css"]
})
export class ViewEnrichmentComponent implements OnInit, OnChanges {
  @Output() editClicked = new EventEmitter();

  @Input() enrichData: any;
  @Input() problemId: number;
  enrichmentVoted = false;
  numberOfVotes: number;
  showModal = false;
  combinedImgAndVideo: any[] = [];
  index = 0;
  videoStatus = false;
  modalSrc: String;

  /* this.enrichData.video_urls.push({
      key: 'sample.mp4',
      url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4'
    }); */

  constructor(
    private problemHandleService: ProblemHandleService,
    private enrichmentHandlerService: EnrichmentHandlerService,
    private auth: AuthService
  ) {
    console.log("aswewrwe");
  }

  ngOnInit() {
    this.combinedImgAndVideo = [
      ...this.enrichData.image_urls,
      ...this.enrichData.video_urls
    ];
    if (this.enrichData.voted_by) {
      this.enrichData.voted_by.forEach(userId => {
        if (userId === Number(this.auth.currentUserValue.id)) {
          // console.log(userId, "userId");
          this.enrichmentVoted = true;
        }
      });
      this.numberOfVotes = this.enrichData.voted_by.length;
    }

    // this.numberOfVotes = Object.keys(this.enrichData.voted_by).length;
    // if (this.enrichData.voted_by.abc123) {
    //   this.enrichmentVoted = true;
    // }
  }
  ngOnChanges() {
    // console.log(this.enrichData, 'works');
  }

  voteEnrichment() {
    this.enrichmentVoted = !this.enrichmentVoted;
    console.log("clicked");
    if (this.enrichmentVoted) {
      this.numberOfVotes++;
      console.log(this.enrichData.voted_by, "voted by");
      if (!this.enrichData.voted_by) {
        this.enrichData.voted_by = [];
      }
      this.enrichData.voted_by.push(Number(this.auth.currentUserValue.id));
      // console.log(this.enrichData, "enrich data", this.problemId);
      console.log(this.enrichData.voted_by, "voted by 2");
      this.enrichmentHandlerService.storeEnrichmentVotedBy(this.enrichData);
    } else {
      this.numberOfVotes--;
      let index = this.enrichData.voted_by.indexOf(Number(this.auth.currentUserValue.id));
      this.enrichData.voted_by.splice(index, 1);
      this.enrichmentHandlerService.storeEnrichmentVotedBy(this.enrichData);
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
    this.editClicked.emit(this.enrichData);
  }

  deleteEnrichment() {
    this.enrichmentHandlerService.deleteEnrichment(this.enrichData.id);
  }
}
