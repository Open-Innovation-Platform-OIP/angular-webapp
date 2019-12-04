import {
  Component,
  OnInit,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';

import gql from 'graphql-tag';

import { take } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import swal from 'sweetalert2';
import { Apollo, QueryRef } from 'apollo-angular';
import { FilesService } from '../../services/files.service';

@Component({
  selector: 'app-view-enrichment',
  templateUrl: './view-enrichment.component.html',
  styleUrls: ['./view-enrichment.component.css']
})
export class ViewEnrichmentComponent implements OnInit, OnChanges, OnDestroy {
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
  voters: any = new Set();

  constructor(
    private auth: AuthService,
    private apollo: Apollo,
    private filesService: FilesService
  ) {
    this.enrichmentVoted = false;
  }

  ngOnInit() {
    const embedded_url_arr = this.enrichmentData.embed_urls.map(url => {
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
    this.voters = new Set();

    this.enrichmentData.enrichment_voters.map(voter => {
      this.voters.add(voter.user_id);
    });

    const embedded_url_arr = this.enrichmentData.embed_urls.map(url => {
      return { url: url };
    });

    this.combinedImgAndVideo = [
      ...this.enrichmentData.image_urls,
      ...this.enrichmentData.video_urls,
      ...this.enrichmentData.attachments,
      ...embedded_url_arr
    ];

    this.modalSrc = this.combinedImgAndVideo[this.index];
  }

  voteEnrichment() {
    if (this.auth.currentUserValue.id) {
      if (
        !(this.enrichmentData.user_id === Number(this.auth.currentUserValue.id))
      ) {
        if (!this.voters.has(this.auth.currentUserValue.id)) {
          this.voters.add(this.auth.currentUserValue.id);
          const add_voter = gql`
            mutation insert_enrichment_voters {
              insert_enrichment_voters(
                objects: [
                  {
                    user_id: ${Number(this.auth.currentUserValue.id)},
                    enrichment_id: ${Number(this.enrichmentData.id)}
                  }
                ]
              ) {
                returning {

                  user_id

                }
              }
            }
          `;
          this.apollo
            .mutate({
              mutation: add_voter
            })
            .pipe(take(1))
            .subscribe(
              result => {
                if (result.data) {
                }
              },
              err => {
                console.error(JSON.stringify(err));
              }
            );
        } else {
          // user is currently not watching this problem
          // let's remove them
          this.voters.delete(this.auth.currentUserValue.id);
          const delete_voter = gql`
            mutation delete_enrichment_voter {
              delete_enrichment_voters(
                where: {user_id: {_eq: ${Number(
                  this.auth.currentUserValue.id
                )}}, enrichment_id: {_eq: ${Number(this.enrichmentData.id)}}}
              ) {
                affected_rows
              }
            }
          `;
          this.apollo
            .mutate({
              mutation: delete_voter
            })
            .pipe(take(1))
            .subscribe(
              result => {
                if (result.data) {
                }
              },
              err => {
                console.error(JSON.stringify(err));
              }
            );
        }
      }
    }
  }

  ngOnDestroy() {
    this.voters = new Set();
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
    this.editClicked.emit(this.enrichmentData);
  }

  deleteEnrichment() {
    swal({
      title: 'Are you sure you want to delete enrichment?',

      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'Yes, delete it!',
      buttonsStyling: false
    }).then(result => {
      if (result.value) {
        this.deleteClicked.emit(this.enrichmentData.id);
      }
    });
  }

  checkUrlIsImg(url) {
    const arr = ['jpeg', 'jpg', 'gif', 'png'];
    const ext = url.substring(url.lastIndexOf('.') + 1);
    if (arr.indexOf(ext) > -1) {
      return true;
    } else {
      return false;
    }
  }

  toggleView(e) {
    if (e.type === 'click') {
      const problemVideoTag: HTMLMediaElement = document.querySelector(
        '#modalVideo'
      );
      this.showModal = false;
      if (problemVideoTag) {
        problemVideoTag.pause();
      }
    }
  }
}
