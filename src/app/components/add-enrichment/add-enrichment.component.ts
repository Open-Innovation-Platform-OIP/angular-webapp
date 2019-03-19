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
import { ProblemService } from "../../services/problem-handle.service";
import * as Query from "../../services/queries";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import swal from "sweetalert2";
import { EnrichmentService } from "../../services/enrichment.service";
import { FilesService } from "../../services/files.service";
import { AuthService } from "../../services/auth.service";
import { GeocoderService } from "../../services/geocoder.service";

@Component({
  selector: "app-add-enrichment",
  templateUrl: "./add-enrichment.component.html",
  styleUrls: ["./add-enrichment.component.css"]
})
export class AddEnrichmentComponent implements OnChanges, OnInit {
  @Input() enrichmentData: any = {
    description: "",
    location: "",
    organization: "",
    resources_needed: "",
    image_urls: [],
    video_urls: [],
    impact: "",
    min_population: 0,
    extent: "",
    beneficiary_attributes: "",
    voted_by: "{}"
  };

  @Output() submitted = new EventEmitter();
  mode = "Add";
  imgSrc: any = "./assets/img/image_placeholder.jpg";

  sizes = [
    { value: 100, viewValue: ">100" },
    { value: 1000, viewValue: ">1000" },
    { value: 10000, viewValue: ">10000" },
    { value: 100000, viewValue: ">100,000" }
  ];

  public locations: Array<any>;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private imgUpload: FilesService,
    private problemService: ProblemService,
    private apollo: Apollo,
    private enrichmentService: EnrichmentService,
    private auth: AuthService,
    private here: GeocoderService
  ) {}

  ngOnInit() {}

  ngOnChanges() {
    // this.enrichmentData.problem_id = this.problemId;
    if (this.enrichmentData) {
      this.mode = "Edit";
      console.log(this.mode, "mode on enrich edit");
      this.enrichmentData = this.enrichmentData;
      console.log(this.enrichmentData, "test");
    }
  }
  public getAddress() {
    if (this.enrichmentData.location != "") {
      this.here.getAddress(this.enrichmentData.location).then(
        result => {
          this.locations = <Array<any>>result;
        },
        error => {
          console.error(error);
        }
      );
    }
  }
  public storeLocation(loc) {
    this.enrichmentData.location = loc.srcElement.innerText;
    this.locations = [];
    console.log(this.enrichmentData.location);
  }
  sendEnrichDataToDB() {
    this.submitted.emit(this.enrichmentData);
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
              this.enrichmentData.image_urls.push({
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
          this.enrichmentData.video_urls.push({
            key: values["Key"],
            url: values["Location"]
          });
        })
        .catch(e => console.log("Err:: ", e));
    }
  }

  removeEnrichPhoto(index) {
    this.imgUpload
      .deleteFile(this.enrichmentData.image_urls[index]["key"])
      .promise()
      .then(data => {
        console.log("Deleted file: ", data);
        this.enrichmentData.image_urls.splice(index, 1);
        console.log("removed photo: ", this.enrichmentData.image_urls);
      })
      .catch(e => {
        console.log("Err: ", e);
      });
  }

  removeEnrichVideo(index) {
    this.imgUpload
      .deleteFile(this.enrichmentData.video_urls[index]["key"])
      .promise()
      .then(data => {
        console.log("Deleted file: ", data);
        this.enrichmentData.video_urls.splice(index, 1);
        console.log("removed video");
      })
      .catch(e => {
        console.log("Err: ", e);
      });
  }
}
