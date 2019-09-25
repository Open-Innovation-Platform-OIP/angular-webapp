import { Component, OnInit, OnDestroy } from "@angular/core";
import { Apollo, QueryRef } from "apollo-angular";
import gql from "graphql-tag";
import { Observable, Subscription } from "rxjs";
import { P } from "@angular/cdk/keycodes";
import { AuthService } from "../../services/auth.service";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { TagsService } from "../../services/tags.service";
import { take, switchMap } from "rxjs/operators";
import { FilterService } from "../../services/filter.service";
import { GeocoderService } from "src/app/services/geocoder.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  selector: "app-problems-view",
  templateUrl: "./problems-view.component.html",
  styleUrls: ["./problems-view.component.css"]
})
export class ProblemsViewComponent implements OnInit, OnDestroy {
  userProblems = [];
  problems = [];
  file_types = [
    "application/msword",
    " application/vnd.ms-excel",
    " application/vnd.ms-powerpoint",
    "text/plain",
    " application/pdf",
    " image/*",
    "video/*"
  ];
  // test: Observable<any>;
  userProblemViewQuery: QueryRef<any>;
  userProblemViewSubscription: Subscription;
  problemViewQuery: QueryRef<any>;
  problemViewSubscription: any;
  constructor(
    private apollo: Apollo,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private tagsService: TagsService,
    private filterService: FilterService,
    private route: ActivatedRoute,
    private geoService: GeocoderService,
    private http: HttpClient,
  ) {
    // this.tagsService.getTagsFromDB();
    this.tagsService
      .getTagsFromDB()
      .then(result => {
        return this.geoService.getLocationsFromDB();
      })
      .then(result => {
        this.getProblems();
      })
      .catch(err => console.log(err, "error"));
  }

  ngOnInit() {
    this.getProblems();
  }

  getProblems() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.filterService.selectedSectors = this.filterService.filterSector(
        params
      );
      this.filterService.selectedLocation = this.filterService.filterLocation(
        params
      );

      console.log(
        this.filterService.location_filter_header,
        "location filter header",
        this.filterService.sector_filter_query
      );

      this.problemViewQuery = this.apollo.watchQuery<any>({
        query: gql`
      
          query table${this.filterService.location_filter_header}{ 
            problems(where:{is_draft: { _eq: false },_and:[{problems_tags:{tag_id:{${this.filterService.sector_filter_query}}}},${this.filterService.location_filter_query}]} order_by: {  updated_at: desc } )
            
             
            {
            id
            title
            description
            
            resources_needed
            image_urls
            edited_at
            updated_at

            featured_url

            is_deleted
            problem_voters {
              problem_id
              user_id
            }
            problem_watchers {
              problem_id
              user_id
            }
            problem_locations{
              location{
                id
                location_name
                lat
                long
              }
            }
            problem_locations{
              location{
                location_name
                id
              }
            }
            problem_validations {
              user_id
              comment
              agree
              created_at
              files
              user_id
              edited_at
              is_deleted
              problem_id
            }
            problem_collaborators {
              user_id
              problem_id
              edited_at
            }
              
          }
        }
      
    `,
        variables: this.filterService.queryVariable,
        pollInterval: 500,
        fetchPolicy: "network-only"
      });

      this.problemViewSubscription = this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
          return this.problemViewQuery.valueChanges;
        })
      );

      this.problemViewSubscription.subscribe(
        result => {
          console.log(result, "results");
          if (result.data.problems.length > 0) {
            // console.log("PROBLEMS", result.data.problems_tags);

            this.problems = result.data.problems;
            console.log("PROBLEMS in Component", this.problems);
          } else {
            this.problems = [];
          }
        },
        error => {
          console.error(JSON.stringify(error));
        }
      );
    });
  }

  test(event) {
    const files = (event.target as HTMLInputElement).files;
    console.log(files);
    let authToken = "";

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      // token = currentUser["token"];
      authToken = currentUser["token"];
    }
    let headers = new HttpHeaders({
      Authorization: authToken
    });
    let options = { headers: headers };

    for (var i = 0; i < files.length; i++) {
      let file = files[i];
      // console.log("file", file.name);
      this.http
        .post(
          "http://minio-microservice.dev.jaagalabs.com/create_presigned_url",
          { file_data: `test/${file.name}` },
          options
        )
        .subscribe(result => {
          console.log(result);
          // console.log("presign result", result);
          if (result && result["presigned_url"]) {
            const httpOptions = {
              headers: new HttpHeaders({
                "Content-Type": `${file["type"]}`
              })
            };

            this.http
              .put(result["presigned_url"], file, httpOptions)
              .subscribe(result => {
                console.log("reuslt", result);
              });
          }
        });
      // // Retrieve a URL from our server.
      // retrieveNewURL(file, (file, url) => {
      //     // Upload the file to the server.
      //     uploadFile(file, url);
      // });
    }

    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     "Content-Type": [
    //       "application/msword",
    //       " application/vnd.ms-excel",
    //       " application/vnd.ms-powerpoint",
    //       "text/plain",
    //       " application/pdf",
    //       " image/*",
    //       "video/*"
    //     ]
    //   })
    // };

    // this.http.post(
    //   "http://minio-microservice.dev.jaagalabs.com/create_presigned_url"
    // );

    // this.http
    //   .put(
    //     "https://minio-storage.dev.jaagalabs.com/test/test5?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=jaaga%2F20190913%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20190913T071132Z&X-Amz-Expires=259200&X-Amz-SignedHeaders=host&X-Amz-Signature=9de20409f6ac6c23daac3127ad5535196b2f623f66fca7e29308833b5fe042fe",
    //     file,
    //     httpOptions
    //   )
    //   .subscribe(result => {
    //     console.log("reuslt", result);
    //   });

    // console.log(file);const file = (event.target as HTMLInputElement).files[0];
    // this.form.patchValue({ image: file });
    // this.form.get("image").updateValueAndValidity();
    // const reader = new FileReader();
    // reader.onload = () => {
    //   this.imagePreview = reader.result as string;
    // };
    // reader.readAsDataURL(file);
  }

  ngOnDestroy() {
    // this.userProblemViewQuery.stopPolling();
    // this.userProblemViewSubscription.unsubscribe();
    this.problemViewQuery.stopPolling();
    this.problemViewSubscription.unsubscribe();
  }
}
