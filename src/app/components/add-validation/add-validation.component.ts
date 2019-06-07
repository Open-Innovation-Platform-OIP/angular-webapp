import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  DoCheck
} from "@angular/core";
import { FilesService } from "../../services/files.service";
import { ProblemService } from "../../services/problem-handle.service";
import swal from "sweetalert2";
import { ValidationService } from "../../services/validation.service";

@Component({
  selector: "app-add-validation",
  templateUrl: "./add-validation.component.html",
  styleUrls: ["./add-validation.component.css"]
})
export class AddValidationComponent implements OnInit {
  @Input() validationData: any = {
    comment: "",
    agree: false,
    files: []
  };
  @Output() submitted = new EventEmitter();

  mode = "Add";
  Arr = [1, 2, 3, 4];
  blankSpace: boolean;

  constructor(
    private space: FilesService // private problemService: ProblemService, // private validationService: ValidationService
  ) { }

  ngOnInit() {
    // console.log(this.validationData, "validation data check");
  }

  async onValidateFileSelected(event) {
    // console.log("Event: ", event);
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      if (!this.isFileDuplicate(file)) {
        let attachment = await this.space
          .uploadFile(file, file["name"])
          .promise();

        this.validationData.files.push({
          key: attachment["key"],
          url: attachment["Location"],
          mimeType: file.type
        });
      } else {
        alert(`File: ${file.name} already exist.`);
        continue;
      }
    }
  }

  isFileDuplicate(file) {
    let found = this.validationData.files.find((attachment) => {
      return attachment["key"] === file.name;
    });

    return this.validationData.files.includes(found);
  }

  removeAttachment(index) {
    if (this.validationData && this.validationData.files.length < 2) {
      this.validationData.files = [];
    } else {
      this.validationData.files.splice(index, 1);
    }
  }

  async validateConsent(userConsent) {
    swal({
      type: "success",
      text: "Thank you for validation",
      timer: 3000,
      showConfirmButton: false
    }).then(res => {
      this.validationData.agree = userConsent;
      this.submitted.emit(this.validationData);
    });
  }

  checkForSpaces(event) {
    let value = this.validationData.comment.trim();
    if (value) {
      this.blankSpace = false;
    } else {
      this.blankSpace = true;
    }
  }
}

// deleting file from digital ocean space
/* this.space
      .deleteFile(this.validationData.files[index]["key"])
      .promise()
      .then(data => {
        console.log("Deleted file: ", data);
        this.validationData.files.splice(index, 1);
        console.log("file removed");
      })
      .catch(e => {
        console.log("Err: ", e);
      }); */
