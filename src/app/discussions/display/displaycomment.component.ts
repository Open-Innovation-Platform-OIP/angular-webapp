import {
  Component,
  ViewChild,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from "@angular/core";
import swal from "sweetalert2";
import { Comment } from "../../services/discussions.service";
import { Apollo, QueryRef } from "apollo-angular";
import { AuthService } from "../../services/auth.service";
import { Subscription } from "rxjs";
import { take } from "rxjs/operators";

import gql from "graphql-tag";
@Component({
  selector: "app-display-comment",
  templateUrl: "./displaycomment.component.html",
  styleUrls: ["./displaycomment.component.css"]
})
export class CommentDisplayComponent implements OnInit, OnDestroy {
  objectValues = Object["values"];
  @Input() comment;
  @Input() replies;
  @Input() users;
  @Input() pageType;
  @Output() reply = new EventEmitter();
  @Output() fileClicked = new EventEmitter();
  @Output() commentToDelete = new EventEmitter();
  @Output() shareCommentId = new EventEmitter();

  userId: Number;
  voters = new Set();

  showReplyBox = false;
  replyingTo = 0;
  attachmentToShow = 2;
  repliesAttachmentNum = 2;
  repliesExpanded = false;
  commentsExpanded = false;

  constructor(private apollo: Apollo, private auth: AuthService) {}
  ngOnInit() {
    this.comment.discussion_voters.map(voter => {
      this.voters.add(voter.user_id);
    });
    this.userId = Number(this.auth.currentUserValue.id);
  }

  sortReplies(replies) {
    if (replies && replies.length) {
      return replies.sort(this.compareDateForSort);
    }
  }

  replyTo(commentId) {
    this.showReplyBox = true;
    this.replyingTo = commentId;
    console.log(commentId);
  }
  async onCommentSubmit(event) {
    const [content, mentions, attachments] = event;

    // let comment = {
    //   created_by: 0,
    //   problem_id: 0,
    //   text: content,
    //   attachments: attachments,
    //   mentions: JSON.stringify(mentions)
    //     .replace("[", "{")
    //     .replace("]", "}"),
    //   linked_comment_id: this.replyingTo
    // };
    this.reply.emit(event);
    this.replyingTo = 0;
    this.showReplyBox = false;
  }

  displayMoreAttachComments() {
    if (this.attachmentToShow === 2) {
      this.attachmentToShow = this.comment.attachments.length;
      this.commentsExpanded = true;
    } else {
      this.attachmentToShow = 2;
      this.commentsExpanded = false;
    }
  }

  displayMoreAttachReplies(attachmentsArr) {
    if (this.repliesAttachmentNum === 2) {
      this.repliesAttachmentNum = attachmentsArr.length;
      this.repliesExpanded = true;
    } else {
      this.repliesAttachmentNum = 2;
      this.repliesExpanded = false;
    }
  }

  assignUrl(files: any[], index: number) {
    // console.log("modal src: ", attachmentObj.length, index);
    this.fileClicked.emit({ attachmentObj: files, index: index });
  }

  compareDateForSort(a, b) {
    var dateA = a.edited_at;
    var dateB = b.edited_at;
    if (dateA < dateB) {
      return 1;
    }
    if (dateA > dateB) {
      return -1;
    }

    return 0;
  }

  idToDelete(commentId) {
    // console.log("you clicked delete!", commentId);
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      buttonsStyling: false,
      confirmButtonClass: "btn btn-warning",
      confirmButtonText: "Yes, delete it!"
    })
      .then(result => {
        if (result.value === true) {
          this.commentToDelete.emit(commentId);
        }
      })
      .catch(swal.noop);
  }

  getCommentIdToShare(commentId, platform) {
    this.shareCommentId.emit({
      id: commentId,
      platform: platform
    });
  }

  toggleVoteDiscussions() {
    console.log(this.comment, "comment", this.userId, "user id");
    // console.log('toggling watch flag');
    // if (!(this.userId == this.comment.created_by)) {
    if (!this.voters.has(this.userId)) {
      // user is not currently watching this problem
      // let's add them
      this.voters.add(this.userId);
      const add_voter = gql`
        mutation insert_discussion_voter {
          insert_discussion_voters(
            objects: [
              {
                user_id: ${Number(this.userId)},
                discussion_id: ${Number(this.comment.id)}
              }
            ]
          ) {
            returning {
              discussion_id
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
              // console.log(result.data);
            }
          },
          err => {
            console.error(JSON.stringify(err));
          }
        );
    } else {
      // user is currently not watching this problem
      // let's remove them
      this.voters.delete(this.userId);
      const delete_voter = gql`
        mutation delete_discussion_voter {
          delete_discussion_voters(
            where: {user_id: {_eq: ${Number(
              this.userId
            )}}, discussion_id: {_eq: ${Number(this.comment.id)}}}
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
              // console.log(result.data);
            }
          },
          err => {
            console.error(JSON.stringify(err));
          }
        );
    }
    // }
  }

  testMimeType(type) {
    // let allowed;
    if (
      type &&
      !type.startsWith("video") &&
      !type.startsWith("image") &&
      !type.endsWith("pdf")
    ) {
      return true;
    } else {
      return false;
    }
  }
  ngOnDestroy() {}
}
