import {
  Component, ViewChild, OnInit, Input,
  Output,
  EventEmitter } from '@angular/core';
import {Comment} from '../../services/discussions.service';
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
  showReplyBox = false;
  replyingTo = 0;
  ngOnInit() {
  }

  replyTo(commentId) {
    this.showReplyBox = true;
    this.replyingTo = commentId;
    console.log(commentId);
  }
  onCommentSubmit(event) {
    const [content, mentions] = event;
    let comment = {
      created_by: 0,
      problem_id: 0,
      text: content,
      mentions: JSON.stringify(mentions)
        .replace("[", "{")
        .replace("]", "}"),
      linked_comment_id: this.replyingTo
    };
    this.reply.emit(comment);
    this.replyingTo = 0;
    this.showReplyBox = false;
  }
}
