import {
  Component,
  OnInit,
  Input,
  Output,
  OnChanges,
  EventEmitter
} from "@angular/core";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-add-collaborator",
  templateUrl: "./add-collaborator.component.html",
  styleUrls: ["./add-collaborator.component.css"]
})
export class AddCollaboratorComponent implements OnInit, OnChanges {
  @Input() collaborator: any = {
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
  @Output() submitted = new EventEmitter();
  @Output() edit = new EventEmitter();

  objectKeys = Object.keys;
  mode = "Add";

  constructor(private auth: AuthService) {}

  ngOnInit() {
    console.log(this.collaborator, "collaborator on ngonit");
  }

  ngOnChanges() {
    if (this.collaborator) {
      this.mode = "Edit";
    }
  }

  collaborate() {
    console.log("working");
    this.submitted.emit(this.collaborator);
  }
}
