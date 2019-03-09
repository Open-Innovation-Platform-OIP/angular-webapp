import { Component, OnInit, Input, OnChanges } from "@angular/core";
import { FilesService } from '../../services/files.service';
import { ProblemHandleService } from '../../services/problem-handle.service';
import swal from "sweetalert2";

@Component({
  selector: "app-validate-problem",
  templateUrl: "./validate-problem.component.html",
  styleUrls: ["./validate-problem.component.css"]
})
export class ValidateProblemComponent implements OnChanges {
  @Input() problemData: any;
  @Input() validationData: any;
  mode = "Add";
  Arr = [1, 2, 3, 4];
  // validationData: any = {
  //   comment: "",
  //   problem_id: this.problemData.id,
  //   file_url: ""
  // };
  constructor(
    private space: FilesService,
    private problemHandleService: ProblemHandleService
  ) {}

  ngOnChanges() {
    if (this.validationData) {
      this.mode = "Edit";
      this.problemHandleService.problemValidationData = this.validationData;
      console.log(
        this.problemHandleService.problemValidationData,
        "problem service validation data"
      );
    }
    console.log(this.problemData, "problem data in validate ");
  }

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
              this.problemHandleService.problemValidationData.files.push({
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
      .deleteFile(
        this.problemHandleService.problemValidationData.files[index]["key"]
      )
      .promise()
      .then(data => {
        console.log("Deleted file: ", data);
        this.problemHandleService.problemValidationData.files.splice(index, 1);
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
      this.problemHandleService.problemValidationData.agree = userConsent;
      this.problemHandleService.displayValidateProblem = false;
      if (this.mode === "Add") {
        this.problemHandleService.problemValidationData.problem_id = this.problemData.id;
        this.problemHandleService.addValidation();
      }
      if (this.mode === "Edit") {
        this.problemHandleService.updateValidation(
          this.problemHandleService.problemValidationData
        );
      }
    });
  }
}
