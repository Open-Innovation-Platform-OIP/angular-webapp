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
  userId: any;
  voters: any;

  constructor(
    private problemService: ProblemService,
    private auth: AuthService
  ) {
    console.log("aswewrwe");
    this.enrichmentVoted = false;
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
    console.log("ng on change", this.enrichmentVoted);
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
          console.log(
            Number(userId),
            "voted by array",
            Number(this.auth.currentUserValue.id)
          );
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

  // toggleVoteProblem() {
  //   // console.log('toggling watch flag');
  //   if (!(this.userId == this.enrichmentData.created_by)) {
  //     if (!this.voters.has(this.userId)) {
  //       // user is not currently watching this problem
  //       // let's add them
  //       this.voters.add(this.userId);
  //       const add_voter = gql`
  //       mutation insert_problem_voter {
  //         insert_problem_voters(
  //           objects: [
  //             {
  //               user_id: ${Number(this.userId)},
  //               problem_id: ${Number(this.problemData.id)},
  //             }
  //           ]
  //         ) {
  //           returning {
  //             user_id
  //             problem_id
  //           }
  //         }
  //       }
  //     `;
  //       this.apollo
  //         .mutate({
  //           mutation: add_voter
  //         })
  //         .subscribe(
  //           result => {
  //             if (result.data) {
  //               // console.log(result.data);
  //             }
  //           },
  //           err => {
  //             console.error(JSON.stringify(err));
  //           }
  //         );
  //     } else {
  //       // user is currently not watching this problem
  //       // let's remove them
  //       this.voters.delete(this.userId);
  //       const delete_voter = gql`
  //       mutation delete_problem_voter {
  //         delete_problem_voters(
  //           where: {user_id: {_eq: ${Number(
  //             this.userId
  //           )}}, problem_id: {_eq: ${Number(this.problemData.id)}}}
  //         ) {
  //           affected_rows
  //         }
  //       }
  //     `;
  //       this.apollo
  //         .mutate({
  //           mutation: delete_voter
  //         })
  //         .subscribe(
  //           result => {
  //             if (result.data) {
  //               // console.log(result.data);
  //             }
  //           },
  //           err => {
  //             console.error(JSON.stringify(err));
  //           }
  //         );
  //     }
  //   }
  // }

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
