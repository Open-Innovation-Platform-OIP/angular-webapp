import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter
} from "@angular/core";
import { CollaborationService } from "../../services/collaboration.service";
import { AuthService } from "../../services/auth.service";
import { Router, ActivatedRoute } from "@angular/router";

import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import swal from "sweetalert2";
declare var $: any;

@Component({
  selector: "app-collaborator-card",
  templateUrl: "./collaborator-card.component.html",
  styleUrls: ["./collaborator-card.component.css"]
})
export class CollaboratorCardComponent implements OnInit, OnChanges {
  @Input() collaboratorData: any;
  @Output() editClicked = new EventEmitter();
  @Output() deleteClicked = new EventEmitter();
  collaboratorProfileData: any;
  currentUser: Number;
  roles: any = [];
  collaboratorDataToEdit: any = {
    intent: "",
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
    private apollo: Apollo
  ) {}

  ngOnInit() {
    console.log("works ngoninit");
    this.currentUser = Number(this.auth.currentUserValue.id);
    console.log(this.currentUser, "curr", this.collaboratorData.user_id);
  }

  ngOnChanges() {
    this.roles = [];
    console.log("works");
    if (typeof this.collaboratorData === "object") {
      Object.entries(this.collaboratorData).map(collabData => {
        if (typeof collabData[1] === "boolean" && collabData[1]) {
          this.roles.push(collabData[0]);
        }
      });

      // this.apollo
      //   .watchQuery<any>({
      //     query: gql`
      //         {
      //          users(where: { id: { _eq: ${this.collaboratorData.user_id} } }) {
      //            id
      //            name
      //            photo_url

      //          }

      //         }
      //            `
      //     // pollInterval: 500
      //   })
      //   .valueChanges.subscribe(
      //     result => {
      //       console.log(result, "user in collaborator card");
      //       this.collaboratorProfileData = result.data.users[0];
      //     },
      //     error => {
      //       console.log("could not get collaborators due to ", error);
      //     }
      //   );
    }
  }

  editCollaboration() {
    Object.keys(this.collaboratorDataToEdit).map(key => {
      // console.log(key, result.data.problems[0][key]);

      this.collaboratorDataToEdit[key] = this.collaboratorData[key];
    });
    this.editClicked.emit(this.collaboratorDataToEdit);
  }

  deleteCollaboration() {
    swal({
      title: "Are you sure you want to delete collaboration?",
      // text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      confirmButtonText: "Yes, delete it!",
      buttonsStyling: false
    }).then(result => {
      if (result.value) {
        this.deleteClicked.emit(this.collaboratorData);
        swal({
          title: "Deleted!",
          // text: "Your file has been deleted.",
          type: "success",
          confirmButtonClass: "btn btn-success",
          buttonsStyling: false
        });
      }
    });
  }
}
