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
  @Input() comment;
  @Output() replyClick = new EventEmitter();

  ngOnInit() {
  }

}
