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
  file_blob: Blob[] = [];
  // validationData: any = {
  //   comment: "",
  //   problem_id: this.problemData.id,
  //   file_url: ""
  // };
  constructor(
    private space: FilesService,
    private problemService: ProblemService,
    private validationService: ValidationService
  ) { }

  onValidateFileSelected(event) {
    console.log("Event: ", event);
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];

      this.file_blob.push(file);
      /* if (typeof FileReader !== "undefined") {
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
                mimeType: file.type,
                key: values["Key"]
              });
            })
            .catch(e => console.log("Err:: ", e));
        };
        reader.readAsArrayBuffer(file);
      } */
    }
  }

  removeAttachedFile(index) {
    if (this.file_blob.length < 2) {
      this.file_blob = [];
    } else {
      this.file_blob.splice(index, 1);
    }
  }

  removeAttachment(index) {
    if (this.validationData && this.validationData.files.length < 2) {
      this.validationData.files = [];
    } else {
      this.validationData.files.splice(index, 1);
    }
  }

  async validateConsent(userConsent) {
    let attachments: any[] = [];
    let _links = []; //local array

    let all_promise = await this.file_blob.map(file => {
      return this.space.uploadFile(file, file['name']).promise();
    });

    try {
      _links = await Promise.all(all_promise);
    } catch (error) {
      console.log("Err while uploading reply files");
    }

    if (_links.length) {
      attachments = [];

      _links.forEach((link, i) => {
        attachments.push({
          key: link["key"],
          url: link["Location"],
          mimeType: this.file_blob[i].type
        });
      });
    }

    swal({
      type: "success",
      text: "Thank you for validation",
      confirmButtonClass: "btn btn-success",
      buttonsStyling: false
    }).then(res => {
      this.validationData.agree = userConsent;
      this.validationData.files = [...attachments];
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
