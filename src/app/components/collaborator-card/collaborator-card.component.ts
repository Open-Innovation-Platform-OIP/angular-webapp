import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter
} from '@angular/core';
import { CollaborationService } from '../../services/collaboration.service';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import swal from 'sweetalert2';
import { FilesService } from '../../services/files.service';
declare var $: any;

@Component({
  selector: 'app-collaborator-card',
  templateUrl: './collaborator-card.component.html',
  styleUrls: ['./collaborator-card.component.css']
})
export class CollaboratorCardComponent implements OnInit, OnChanges {
  @Input() collaboratorData: any;
  @Output() editClicked = new EventEmitter();
  @Output() deleteClicked = new EventEmitter();
  collaboratorProfileData: any;
  currentUser: Number;
  roles: any = [];
  collaboratorDataToEdit: any = {
    intent: '',
    is_ngo: false,
    is_innovator: false,
    is_expert: false,
    is_government: false,
    is_funder: false,
    is_beneficiary: false,
    is_incubator: false,
    is_entrepreneur: false
  };

  constructor(
    private collaborationService: CollaborationService,
    private auth: AuthService,
    private apollo: Apollo,
    private filesService: FilesService
  ) {}

  ngOnInit() {
    this.currentUser = Number(this.auth.currentUserValue.id);
  }

  ngOnChanges() {
    this.roles = [];

    if (typeof this.collaboratorData === 'object') {
      Object.entries(this.collaboratorData).map(collabData => {
        if (typeof collabData[1] === 'boolean' && collabData[1]) {
          this.roles.push(collabData[0]);
        }
      });
    }
  }

  editCollaboration() {
    Object.keys(this.collaboratorDataToEdit).map(key => {
      this.collaboratorDataToEdit[key] = this.collaboratorData[key];
    });
    this.editClicked.emit(this.collaboratorDataToEdit);
  }

  deleteCollaboration() {
    swal({
      title: 'Are you sure you want to delete collaboration?',

      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'Yes, delete it!',
      buttonsStyling: false
    }).then(result => {
      if (result.value) {
        this.deleteClicked.emit(this.collaboratorData);
        swal({
          title: 'Deleted!',

          type: 'success',
          confirmButtonClass: 'btn btn-success',
          buttonsStyling: false
        });
      }
    });
  }

  seeMore() {
    swal({
      title: 'Intent',

      html: `<div style="white-space: pre-wrap;text-align: left;">${this.collaboratorData.intent}</div>`,
      timer: 20000,
      showConfirmButton: false
    }).catch(swal.noop);
  }
}
