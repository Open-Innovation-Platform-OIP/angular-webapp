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
  roles: any = [];

  constructor(
    private collaborationService: CollaborationService,
    private auth: AuthService,
    private apollo: Apollo
  ) {}

  ngOnInit() {}

  ngOnChanges() {
    if (typeof this.collaboratorData === "object") {
      Object.entries(this.collaboratorData).map(collabData => {
        if (typeof collabData[1] === "boolean" && collabData[1]) {
          this.roles.push(collabData[0]);
        }
      });

      this.apollo
        .watchQuery<any>({
          query: gql`
            {
             users(where: { id: { _eq: ${this.collaboratorData.user_id} } }) {
               id
               name
               photo_url
   
             } 

            }
               `
        })
        .valueChanges.subscribe(
          result => {
            console.log(result, "user in collaborator card");
            this.collaboratorProfileData = result.data.users[0];
          },
          error => {
            console.log("could not get collaborators due to ", error);
          }
        );
    }
  }

  editCollaboration() {
    this.editClicked.emit(this.collaboratorData);
  }

  deleteCollaboration() {
    this.deleteClicked.emit(this.collaboratorData);
  }
}
