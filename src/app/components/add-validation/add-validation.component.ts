import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  DoCheck
} from '@angular/core';
import { FilesService } from '../../services/files.service';

import swal from 'sweetalert2';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'app-add-validation',
  templateUrl: './add-validation.component.html',
  styleUrls: ['./add-validation.component.css']
})
export class AddValidationComponent implements OnInit {
  @Input() validationData: any = {
    comment: '',
    agree: false,
    files: []
  };
  @Output() submitted = new EventEmitter();

  mode = 'Add';
  Arr = [1, 2, 3, 4];
  blankSpace: boolean;

  constructor(private filesService: FilesService) {}

  ngOnInit() {}

  async onValidateFileSelected(event) {
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      if (!this.isFileDuplicate(file)) {
        this.filesService
          .fileUpload(file, file.type)

          .then(values => {
            this.validationData.files.push({
              fileEndpoint: values['fileEndpoint'],
              mimeType: file.type,
              key: values['key']
            });
          })
          .catch(e => console.error('Err:: ', e));
      } else {
        alert(`File: ${file.name} already exist.`);
        continue;
      }
      // }
    }
  }

  isFileDuplicate(file) {
    const found = this.validationData.files.find(attachment => {
      return attachment['key'] === file.name;
    });

    return this.validationData.files.includes(found);
  }

  removeAttachment(index) {
    let fileName;
    if (this.validationData && this.validationData.files.length < 2) {
      this.validationData.files = [];
    } else {
      fileName = this.validationData.files[index].fileEndpoint.split('/')[1];
      this.filesService.deleteFile(fileName).subscribe(
        result => console.log(result),
        error => {
          console.log(error);
        }
      );

      this.validationData.files.splice(index, 1);
    }
  }

  async validateConsent(userConsent) {
    swal({
      type: 'success',
      text: 'Thank you for validation',
      timer: 3000,
      showConfirmButton: false
    }).then(res => {
      this.validationData.agree = userConsent;
      this.submitted.emit(this.validationData);
    });
  }

  checkForSpaces(event) {
    const value = this.validationData.comment.trim();
    if (value) {
      this.blankSpace = false;
    } else {
      this.blankSpace = true;
    }
  }
}
