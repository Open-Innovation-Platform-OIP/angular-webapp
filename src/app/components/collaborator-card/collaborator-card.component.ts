import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter
} from "@angular/core";
import { ProblemHandleService } from '../../services/problem-handle.service';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from "@angular/router";
import * as Query from '../../services/queries';
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";

@Component({
  selector: "app-collaborator-card",
  templateUrl: "./collaborator-card.component.html",
  styleUrls: ["./collaborator-card.component.css"]
})
export class CollaboratorCardComponent implements OnInit, OnChanges {
  @Input() collaboratorData: any;
  @Input() collaboratorProfileData: any;
  @Output() editClicked = new EventEmitter();
  roles: any;
  // isMyCollaboration: boolean = true;

  constructor(
    private problemHandleService: ProblemHandleService,
    private auth: AuthService,
    private apollo: Apollo
  ) {}

  ngOnInit() {
    // this.personas = this.collaboratorData.personas;
  }

  ngOnChanges() {
    console.log(
      this.collaboratorData.user_id,
      "collaborator data in collaborator card"
    );
    console.log(this.collaboratorProfileData, "collaborator prof data");
    if (typeof this.collaboratorData === "object") {
      // if (this.collaboratorData.user_id === Number(this.auth.currentUserValue.id)) {
      //   this.isMyCollaboration = true;
      // }
      this.roles = this.collaboratorData.collaborate_as;

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

    // console.log(this.collaboratorProfileData, "collaborator profile");
  }

  editCollaboration() {
    this.editClicked.emit(this.collaboratorData);
  }

  deleteCollaboration() {
    this.problemHandleService.deleteCollaboration(this.collaboratorData);
  }
}
