import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  OnChanges
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { first, finalize } from "rxjs/operators";
import { ProblemHandleService } from '../../services/problem-handle.service';
import * as Query from '../../services/queries';
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import swal from "sweetalert2";
import { EnrichmentHandlerService } from '../../services/enrichment-handler.service';
import { FilesService } from '../../services/files.service';
import { AuthService } from '../../services/auth.service';
declare var H: any;
// import { GeocoderService } from '../../services/geocoder.service';
@Component({
  selector: "app-add-enrichment",
  templateUrl: "./add-enrichment.component.html",
  styleUrls: ["./add-enrichment.component.css"]
})
export class AddEnrichmentComponent implements OnChanges, OnInit {
  @Input() problemId: any;
  @Input() enrichmentData: any;

  @Output() enrichmentAdded = new EventEmitter();
  mode = "Add";
  imgSrc: any = "./assets/img/image_placeholder.jpg";

  sizes = [
    { value: 100, viewValue: ">100" },
    { value: 1000, viewValue: ">1000" },
    { value: 10000, viewValue: ">10000" },
    { value: 100000, viewValue: ">100,000" }
  ];
  problemEnrichmentData: any = {
    description: "",
    location: "",
    type: "problem",
    created_at: new Date(),
    edited_at: null,
    solution_id: 0,
    organization: "",
    resources_needed: "",
    image_urls: [],
    video_urls: [],
    voted_by: [],
    impact: "",
    min_population: 0,
    extent: "",
    beneficiary_attributes: "",
    is_deleted: false
  };
  public query: string;
  public query2: string;
  public platform: any;
  public geocoder: any;
  public locations: Array<any>;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private imgUpload: FilesService,
    private problemHandleService: ProblemHandleService,
    private apollo: Apollo,
    private enrichmentHandlerService: EnrichmentHandlerService,
    private auth: AuthService,
    // private here: GeocoderService
  ) {
    console.log("Problem Id: ", this.problemId);
  }

  showSwal(type, id) {
    if (type === "warning-message-and-confirmation") {
      swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn btn-success",
        cancelButtonClass: "btn btn-danger",
        confirmButtonText: "Yes, delete it!",
        buttonsStyling: false
      }).then(result => {
        if (result.value) {
          swal({
            title: "Deleted!",
            text: "Your problem has been deleted.",
            type: "success",
            confirmButtonClass: "btn btn-success",
            buttonsStyling: false
          }).then(res => {
            this.problemHandleService.deleteProblem(id);
          });
        }
      });
    }
  }

  ngOnInit() {
    this.problemEnrichmentData.problem_id = this.problemId;
  }

  ngOnChanges() {
    // this.problemEnrichmentData.problem_id = this.problemId;
    if (this.enrichmentData) {
      this.mode = "Edit";
      this.problemEnrichmentData = this.enrichmentData;
      console.log(this.problemEnrichmentData, "test");
    }
    // this.platform = new H.service.Platform({
    //   app_id: "sug0MiMpvxIW4BhoGjcf",
    //   app_code: "GSl6bG5_ksXDw4sBTnhr_w"
    // });
    // this.geocoder = this.platform.getGeocodingService();
    this.query = " ";
    this.query2 = " ";
  }
  public getAddress() {
    if (this.problemEnrichmentData.location != "") {
      // this.here.getAddress(this.problemEnrichmentData.location).then(
      //   result => {
      //     this.locations = <Array<any>>result;
      //   },
      //   error => {
      //     console.error(error);
      //   }
      // );
    }
  }
  public storeLocation(loc) {
    this.problemEnrichmentData.location = loc.srcElement.innerText;
    console.log(this.problemEnrichmentData.location);
  }
  sendEnrichDataToDB() {
    console.log(this.problemId, "id");

    console.log(this.problemEnrichmentData, "enrichment data");

    console.log(localStorage.getItem("userId"), "user ID");
    this.problemEnrichmentData.created_by = Number(this.auth.currentUserValue.id);
    this.problemEnrichmentData.problem_id = this.problemId;
    this.enrichmentHandlerService
      .addEnrichment(this.problemEnrichmentData)
      .subscribe(
        ({ data }) => {
          console.log("After enrichment success: ", data);
          this.enrichmentAdded.emit(true);
          location.reload();
        },
        error => {
          console.log("Could not add due to " + error);
        }
      );
  }

  updateEnrichmentDataInDB() {
    this.problemEnrichmentData.edited_at = new Date();
    console.log(this.problemEnrichmentData, "updated enrichment data");
    this.enrichmentHandlerService
      .updateEnrichment(
        this.problemEnrichmentData.id,
        this.problemEnrichmentData
      )
      .subscribe(
        ({ data }) => {
          location.reload();
          this.enrichmentAdded.emit(true);
          console.log(data, "enriched data");
        },
        error => {
          console.log("Could not update due to " + error);
        }
      );
  }

  onEnrichImgSelect(event) {
    console.log("Event: ", event);

    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];

      if (typeof FileReader !== "undefined") {
        let reader = new FileReader();

        reader.onload = (e: any) => {
          console.log("Onload: ", e);

          this.imgUpload
            .uploadFile(e.target.result, file.name)
            .promise()
            .then(values => {
              console.log("val: ", values);
              this.problemEnrichmentData.image_urls.push({
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

  onEnrichVideoSelect(event) {
    console.log("Event: ", event);

    for (let i = 0; i < event.target.files.length; i++) {
      const video = event.target.files[i];
      this.imgUpload
        .uploadFile(video, video.name)
        .promise()
        .then(values => {
          console.log("val:: ", values);
          this.problemEnrichmentData.video_urls.push({
            key: values["Key"],
            url: values["Location"]
          });
        })
        .catch(e => console.log("Err:: ", e));
    }
  }

  removeEnrichPhoto(index) {
    this.imgUpload
      .deleteFile(this.problemEnrichmentData.image_urls[index]["key"])
      .promise()
      .then(data => {
        console.log("Deleted file: ", data);
        this.problemEnrichmentData.image_urls.splice(index, 1);
        console.log("removed photo: ", this.problemEnrichmentData.image_urls);
      })
      .catch(e => {
        console.log("Err: ", e);
      });
  }

  removeEnrichVideo(index) {
    this.imgUpload
      .deleteFile(this.problemEnrichmentData.video_urls[index]["key"])
      .promise()
      .then(data => {
        console.log("Deleted file: ", data);
        this.problemEnrichmentData.video_urls.splice(index, 1);
        console.log("removed video");
      })
      .catch(e => {
        console.log("Err: ", e);
      });
  }
}
