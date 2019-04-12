import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter
} from "@angular/core";
import { ProblemService } from "../../services/problem-handle.service";
// import { Router, ActivatedRoute } from "@angular/router";

import { AuthService } from "../../services/auth.service";
import swal from "sweetalert2";

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
    let embedded_url_arr = this.enrichmentData.embed_urls.map(url => {
      return { url: url };
    });

    this.combinedImgAndVideo = [
      ...this.enrichmentData.image_urls,
      ...this.enrichmentData.video_urls,
      ...this.enrichmentData.attachments,
      ...embedded_url_arr
    ];

    this.modalSrc = this.combinedImgAndVideo[this.index];

    // adding embedded links
  }
  ngOnChanges() {
    console.log("ng on change");
    let embedded_url_arr = this.enrichmentData.embed_urls.map(url => {
      return { url: url };
    });

    this.combinedImgAndVideo = [
      ...this.enrichmentData.image_urls,
      ...this.enrichmentData.video_urls,
      ...this.enrichmentData.attachments,
      ...embedded_url_arr
    ];

    this.modalSrc = this.combinedImgAndVideo[this.index];

    // remove the duplicates
    this.enrichmentData.voted_by = Array.from(new Set(this.enrichmentData.voted_by));

    if (this.enrichmentData.voted_by.length) {
      console.log(this.enrichmentData.voted_by, "enrich voted by");

      this.enrichmentData.voted_by.forEach(userId => {
        if (Number(userId) === Number(this.auth.currentUserValue.id)) {
          this.enrichmentVoted = true;
        }
      });
    } else {
      this.enrichmentVoted = false;
    }
  }

  voteEnrichment() {
    if (
      !(
        this.enrichmentData.created_by === Number(this.auth.currentUserValue.id)
      )
    ) {
      let index = this.enrichmentData.voted_by.indexOf(
        Number(this.auth.currentUserValue.id)
      );
      this.enrichmentVoted = !this.enrichmentVoted;
      console.log("clicked");
      if (this.enrichmentVoted && index < 0) {
        this.enrichmentData.voted_by.push(
          Number(this.auth.currentUserValue.id)
        );

        // remove the duplicates
        this.enrichmentData.voted_by = Array.from(new Set(this.enrichmentData.voted_by));

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
  }

  toggleViewForImgNView() {
    this.showModal = true;
  }

  toggleFileSrc(dir: boolean) {
    if (dir && this.index < this.combinedImgAndVideo.length - 1) {
      this.index++;
      this.modalSrc = this.combinedImgAndVideo[this.index];
    }
    if (!dir && this.index > 0) {
      this.index--;
      this.modalSrc = this.combinedImgAndVideo[this.index];
    }
  }

  editEnrichment() {
    console.log("edit clicked");
    this.editClicked.emit(this.enrichmentData);
  }

  deleteEnrichment() {
    swal({
      title: "Are you sure you want to delete enrichment?",
      // text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      confirmButtonText: "Yes, delete it!",
      buttonsStyling: false
    }).then(result => {
      if (result.value) {
        this.deleteClicked.emit(this.enrichmentData.id);

        // swal({
        //   title: "Deleted!",
        //   // text: "Your file has been deleted.",
        //   type: "success",
        //   confirmButtonClass: "btn btn-success",
        //   buttonsStyling: false
        // });
      }
    });
    // this.Vali
    // this.enrichmentHandlerService.deleteEnrichment(this.enrichmentData.id);
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

  toggleView(e) {
    if (e.type === "click") {
      let problemVideoTag: HTMLMediaElement = document.querySelector(
        "#modalVideo"
      );
      this.showModal = false;
      if (problemVideoTag) {
        problemVideoTag.pause();
      }
    }
  }
}
