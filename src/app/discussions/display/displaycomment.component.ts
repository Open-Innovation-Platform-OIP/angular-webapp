import {
  Component, ViewChild, OnInit, Input,
  Output,
  EventEmitter
} from '@angular/core';
import { Comment } from '../../services/discussions.service';
@Component({
  selector: 'app-display-comment',
  templateUrl: './displaycomment.component.html',
  styleUrls: ['./displaycomment.component.css']
})
export class CommentDisplayComponent implements OnInit {
  objectValues = Object['values'];
  @Input() comment;
  @Input() replies;
  @Input() users;
  @Output() reply = new EventEmitter();
  @Output() fileClicked = new EventEmitter();
  showReplyBox = false;
  replyingTo = 0;
  attachmentToShow = 2;
  repliesAttachmentNum = 2;
  repliesExpanded = false;
  commentsExpanded = false;
  ngOnInit() {
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
    var dateA = a.modified_at;
    var dateB = b.modified_at;
    if (dateA < dateB) {
      return 1;
    }
    if (dateA > dateB) {
      return -1;
    }

    return 0;
  }

  testMimeType(type) {
    // let allowed;
    if (type && !type.startsWith('video') && !type.startsWith('image') && !type.endsWith('pdf')) {
      return true;
    } else {
      return false;
    }
  }
}
