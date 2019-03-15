import {
  Component, ViewChild, OnInit, Input,
  Output,
  EventEmitter } from '@angular/core';
import * as Quill from 'quill/dist/quill.js';
import ImageResize from 'quill-image-resize-module';
import {ImageDrop} from 'quill-image-drop-module';
Quill.register('modules/imageResize', ImageResize);
Quill.register('modules/imageDrop', ImageDrop);
import 'quill-mention';
import { QuillEditorComponent } from 'ngx-quill';
@Component({
  selector: 'app-submit-comment',
  templateUrl: './submitcomment.component.html',
  styleUrls: ['./submitcomment.component.css']
})
export class CommentSubmitComponent implements OnInit {
  @ViewChild(QuillEditorComponent) editor: QuillEditorComponent;
  @Input() actionText = "Comment";
  @Input() users = [
    {
      id: 1,
      value: 'Vineeth'
    },
    {
      id: 2,
      value: 'Jacob'
    }
  ];
  @Output() submitted = new EventEmitter();
  content = '';
  mentions = [];
  modules = {
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      listItemClass: 'ql-mention-list-item',
      mentionListClass: 'ql-mention-list',
      mentionContainerClass: 'ql-mention-list-container',
      onSelect: (item, insertItem) => {
        const editor = this.editor.quillEditor as Quill;
        insertItem(item);
        this.mentions.push(Number(item.id));
        // necessary because quill-mention triggers changes as 'api' instead of 'user'
        editor.insertText(editor.getLength() - 1, '', 'user');
      },
      source: (searchTerm, renderList) => {
        if (searchTerm.length === 0) {
          renderList(this.users, searchTerm);
        } else {
          const matches = [];
          this.users.forEach((entry) => {
            if (entry.value.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
              matches.push(entry);
            }
          });
          renderList(matches, searchTerm);
        }
      }
    },
    imageDrop: true,
    imageResize: {
      modules: ['Resize', 'DisplaySize', 'Toolbar'],
      handleStyles: {
        backgroundColor: 'black',
        border: 'none',
        color: "white"
        // other camelCase styles for size display
      }
    },
    toolbar: [['bold', 'italic', 'blockquote'], ['link', 'image', 'video']]
  }

  setFocus(event) {
    // tslint:disable-next-line:no-console
    console.log(event);
    event.focus();
  }

  submit() {
    // console.log(this.mentions, this.content);
    this.submitted.emit([this.content, this.mentions]);
    this.content = '';
    this.mentions = [];
  }

  ngOnInit() {
  }

}
