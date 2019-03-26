import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FilesService } from "../../services/files.service";
import { ProblemService } from "../../services/problem-handle.service";
import swal from "sweetalert2";
import { ValidationService } from "../../services/validation.service";

@Component({
  selector: "app-validate-problem",
  templateUrl: "./validate-problem.component.html",
  styleUrls: ["./validate-problem.component.css"]
})
export class ValidateProblemComponent {
  // @Input() problemData: any;
  @Input() validationData: any = {
    comment: "",
    agree: false,
    files: []
  };
  @Output() submitted = new EventEmitter();

  mode = "Add";
  Arr = [1, 2, 3, 4];
  blankSpace: boolean;
  // validationData: any = {
  //   comment: "",
  //   problem_id: this.problemData.id,
  //   file_url: ""
  // };
  constructor(
    private space: FilesService,
    private problemService: ProblemService,
    private validationService: ValidationService
  ) {}

  onValidateFileSelected(event) {
    console.log("Event: ", event);
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];

      if (typeof FileReader !== "undefined") {
        let reader = new FileReader();

        reader.onload = (e: any) => {
          console.log("Onload: ", e);

          this.space
            .uploadFile(e.target.result, file.name)
            .promise()
            .then(values => {
              console.log("val: ", values);
              this.validationData.files.push({
                url: values["Location"],
                key: values["Key"]
              });
            })
            .catch(e => console.log("Err:: ", e));
        };
        reader.readAsArrayBuffer(file);
      }
    }
  }

  removeAttachedFile(index) {
    this.space
      .deleteFile(this.validationData.files[index]["key"])
      .promise()
      .then(data => {
        console.log("Deleted file: ", data);
        this.validationData.files.splice(index, 1);
        console.log("file removed");
      })
      .catch(e => {
        console.log("Err: ", e);
      });
  }

  validateConsent(userConsent) {
    swal({
      type: "success",
      text: "Thank you for validation",
      confirmButtonClass: "btn btn-success",
      buttonsStyling: false
    }).then(res => {
      this.validationData.agree = userConsent;
      // this.problemService.displayValidateProblem = false;

      // this.validationData.problem_id = this.problemData.id;
      // this.validationService.submitValidationToDB(this.validationData);

      this.submitted.emit(this.validationData);

      // if (this.mode === "Edit") {
      //   this.problemService.submitValidation(
      //     this.problemService.problemValidationData
      //   );
      // }
    });
  }

  checkForSpaces($event) {
    let value = this.validationData.comment.trim();
    if (value) {
      this.blankSpace = false;
    } else {
      this.blankSpace = true;
    }
  }
}
