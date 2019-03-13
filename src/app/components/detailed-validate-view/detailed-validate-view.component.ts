import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter
} from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { ProblemHandleService } from "../../services/problem-handle.service";

@Component({
  selector: "app-detailed-validate-view",
  templateUrl: "./detailed-validate-view.component.html",
  styleUrls: ["./detailed-validate-view.component.css"]
})
export class DetailedValidateViewComponent implements OnInit, OnChanges {
  @Input() validationData: any;
  @Output() editClicked = new EventEmitter();
  @Output() deleteClicked = new EventEmitter();

  constructor(
    private auth: AuthService,
    private problemHandleService: ProblemHandleService
  ) {}

  ngOnInit() {
    console.log(this.validationData, "in detailed validate");
  }
  ngOnChanges() {
    console.log(this.validationData, "in detailed validate");
  }
  editValidation() {
    this.editClicked.emit(this.validationData);
  }

  deleteValidation() {
    this.deleteClicked.emit(this.validationData);
    // this.ValidaService.deleteValidation(this.validationData);
  }
}
