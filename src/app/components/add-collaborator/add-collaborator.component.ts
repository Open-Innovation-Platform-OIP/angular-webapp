import { Component, OnInit, Input, Output, OnChanges, EventEmitter } from "@angular/core";
import { AuthService } from '../../services/auth.service';
import { ProblemHandleService } from '../../services/problem-handle.service';
import { CollaborationService } from "src/app/services/collaboration.service";
import { collaborator } from "src/app/services/collaboration.service";

@Component({
  selector: "app-add-collaborator",
  templateUrl: "./add-collaborator.component.html",
  styleUrls: ["./add-collaborator.component.css"]
})
export class AddCollaboratorComponent implements OnInit {
  @Input() problemId: any;
  @Input() collaboratorDataToEdit: any;
  @Output() submitted = new EventEmitter();
  // collaborateAsArray: any[] = [];
  objectKeys = Object.keys;
  mode = "Add";
  // roleSelected: boolean = false;
  // collaborator = {} as collaborator;
  collaborator: collaborator = {
    intent: '',
    roles: {
      ngo: false,
      innovator: false,
      entrepreneur: false,
      expert: false,
      government: false,
      beneficiary: false,
      incubator: false,
      funder: false,
    }
  }

  // collaboratorData: any = {
  //   intent: "",
  // };

  // collaborateAs: any = {
  //   innovator: false,
  //   entrepreneur: false,
  //   expert: false,
  //   government: false,
  //   "user/beneficiary": false,
  //   "incubator/enabler": false,
  //   ngo: false,
  //   funder: false
  // };

  constructor(
    private auth: AuthService,
    private problemHandleService: ProblemHandleService,
    private collaborationService: CollaborationService
  ) {
  }

  ngOnInit() {
    console.log(Object.keys(this.collaborator.roles), 'collaborate this!');

  }

  // ngOnChanges() {
  //   if (this.collaboratorDataToEdit) {
  //     this.mode = "Edit";
  //     // this.collaboratorData.intent = this.collaboratorDataToEdit.intent;
  //     // this.collaboratorDataToEdit.collaborate_as.map(role => {
  //     //   for (let key in this.collaborateAs) {
  //     //     if (key === role) {
  //     //       this.collaborateAs[key] = true;
  //     //     }
  //     //   }
  //     // });
  //     // console.log(this.collaborateAs, "collaborate as");
  //   }
  // }

  collaborate() {
    // console.log(this.collaborator);
    this.submitted.emit(this.collaborator);
    // this.collaboratorData.timestamp = new Date();
    // this.collaboratorData.user_id = Number(this.auth.currentUserValue.id);
    // this.collaboratorData.problem_id = this.problemId;

    // console.log(this.collaborateAs, "persona object");
    // Object.entries(this.collaborateAs).forEach(persona => {
    //   console.log(persona);
    //   if (persona[1]) {
    //     this.collaborateAsArray.push(persona[0]);
    //   }
    // });
    // this.collaboratorData.collaborate_as = this.collaborateAsArray;

    // if (this.collaborateAsArray.length > 0) {
    //   console.log(this.collaborateAsArray, "test array");
    //   this.problemHandleService.addCollaborator(this.collaboratorData);
    // } else {
    //   alert("Please select a role");
    // }
  }

  editCollaboration() {
    // this.collaborateAsArray = [];
    // Object.entries(this.collaborateAs).forEach(persona => {
    //   console.log(persona);
    //   if (persona[1]) {
    //     this.collaborateAsArray.push(persona[0]);
    //   }
    // });
    // this.collaboratorData.collaborate_as = this.collaborateAsArray;
    // this.collaboratorData.edited_at = new Date();
    // this.problemHandleService.updateCollaboration(
    //   this.collaboratorData,
    //   this.problemId,
    //   this.collaboratorDataToEdit.user_id
    // );
  }
}
