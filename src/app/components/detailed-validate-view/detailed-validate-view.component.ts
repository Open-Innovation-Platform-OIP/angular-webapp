import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter
} from '@angular/core';
import { AuthService } from '../../services/auth.service';

import swal from 'sweetalert2';
import { FilesService } from '../../services/files.service';
declare var $: any;

@Component({
  selector: 'app-detailed-validate-view',
  templateUrl: './detailed-validate-view.component.html',
  styleUrls: ['./detailed-validate-view.component.css']
})
export class DetailedValidateViewComponent implements OnInit, OnChanges {
  @Input() validationData: any;
  @Output() editClicked = new EventEmitter();
  @Output() deleteClicked = new EventEmitter();
  validationDataToEdit: any = {
    comment: '',
    agree: false,
    files: []
  };

  constructor(private auth: AuthService, private filesService: FilesService) {}

  ngOnInit() {}
  ngOnChanges() {}
  editValidation() {
    Object.keys(this.validationDataToEdit).map(key => {
      if (typeof this.validationDataToEdit[key] === 'object') {
        this.validationDataToEdit[key] = [...this.validationData[key]];
      } else {
        this.validationDataToEdit[key] = this.validationData[key];
      }
    });

    this.editClicked.emit(this.validationDataToEdit);
  }

  deleteValidation() {
    swal({
      title: 'Are you sure you want to delete validation?',

      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'Yes, delete it!',
      buttonsStyling: false
    }).then(result => {
      if (result.value) {
        this.deleteClicked.emit(this.validationData);
      }
    });
  }
}
