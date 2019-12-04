import {
  Component,
  ViewChild,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import * as Quill from 'quill/dist/quill.js';
import ImageResize from 'quill-image-resize-module';
import { AuthService } from '../../services/auth.service';
import {
  FocusMonitor,
  LiveAnnouncer,
  AriaLivePoliteness
} from '@angular/cdk/a11y';
// import {ImageDrop} from 'quill-image-drop-module';
Quill.register('modules/imageResize', ImageResize);
// Quill.register('modules/imageDrop', ImageDrop);
import 'quill-mention';
import { QuillEditorComponent } from 'ngx-quill';
import { FilesService } from 'src/app/services/files.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { type } from 'os';
@Component({
  selector: 'app-submit-comment',
  templateUrl: './submitcomment.component.html',
  styleUrls: ['./submitcomment.component.css']
})
export class CommentSubmitComponent implements OnInit {
  @ViewChild(QuillEditorComponent) editor: QuillEditorComponent;
  @Input() actionText = 'Comment';
  @Input() cancelShown = false;
  @Input() id;
  @Input() users;
  @Input() pageType;
  @Output() submit = new EventEmitter();
  @Output() cancel = new EventEmitter();
  content = '';
  blankSpace: Boolean = true;
  mentions = [];
  attachments: Blob[] = [];
  file_types = [
    'application/msword',
    ' application/vnd.ms-excel',
    ' application/vnd.ms-powerpoint',
    'text/plain',
    ' application/pdf',
    ' image/*',
    'video/*'
  ];
  modules = {
    mention: {
      listItemClass: 'ql-mention-list-item',
      mentionListClass: 'ql-mention-list',
      mentionContainerClass: 'ql-mention-list-container custom',
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      contenteditable: false,
      isolateCharacter: true,
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
          this.users.forEach(entry => {
            if (
              entry.value.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
            ) {
              matches.push(entry);
            }
          });
          renderList(matches, searchTerm);
        }
      }
    },
    keyboard: { bindings: { tab: false } },
    // imageDrop: true,
    imageResize: {
      modules: ['Resize', 'DisplaySize', 'Toolbar'],
      handleStyles: {
        backgroundColor: 'black',
        border: 'none',
        color: 'white'
        // other camelCase styles for size display
      }
    },
    toolbar: [['bold', 'italic', 'blockquote'], ['link']]
  };

  constructor(
    public auth: AuthService,
    public fileService: FilesService,
    private ngxService: NgxUiLoaderService,
    private focusMonitor: FocusMonitor,
    private liveAnnouncer: LiveAnnouncer
  ) {}

  setFocus(event) {
    // tslint:disable-next-line:no-console
    // console.log(event);
    event.focus();
  }

  announcement(message: string, politeness?: AriaLivePoliteness) {
    this.liveAnnouncer
      .announce(message, politeness)
      .then(x => console.log('announced'))
      .catch(e => console.error(e));
  }

  submitComment() {
    this.fileService.fileinput_id = `fileInput-${this.id}`;
    this.submit.emit([this.content, this.mentions, this.attachments]);
    this.showLoader();
    this.content = '';
    this.mentions = [];
    this.attachments = [];
    this.announcement('Comment submitted');
  }

  checkForSpaces(input) {
    console.log('checking for spaces', input.target.innerText.length);
    if (input.target.innerText.length > 0) {
      let value = input.target.innerText.trim();
      console.log(value.length, value, 'trim value');
      if (value.length) {
        this.blankSpace = false;
      } else {
        this.blankSpace = true;
      }
      console.log(this.blankSpace, 'blankspace');
    }
  }

  ngOnInit() {
    console.log('discussion type', this.pageType);
  }

  onFileSelected(attach_files) {
    if (attach_files && attach_files.target.files) {
      for (let i = 0; i < attach_files.target.files.length; i++) {
        const file = attach_files.target.files[i];
        if (!this.isFileDuplicate(file)) {
          this.attachments.push(file);
        } else {
          alert(`File: ${file.name} already exist.`);
          continue;
        }
      }
    }
  }

  isFileDuplicate(file) {
    let found = this.attachments.find(attachment => {
      return attachment['name'] === file.name;
    });

    return this.attachments.includes(found);
  }

  removeFile(i) {
    if (this.attachments.length === 1) {
      this.attachments = [];
    } else {
      this.attachments.splice(i, 1);
    }
  }

  showLoader() {
    this.ngxService.start('submitComment');

    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop('submitComment');
    }, 2000);
  }
}
