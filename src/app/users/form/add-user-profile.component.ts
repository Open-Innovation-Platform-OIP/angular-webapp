import { Component, OnInit, OnChanges } from "@angular/core";
import { UserHandlerService } from '../../services/user-handler.service';
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Router, ActivatedRoute } from "@angular/router";
import { first, finalize } from "rxjs/operators";
import { AuthService } from '../../services/auth.service';
import { FilesService } from '../../services/files.service';
import { TagsService } from '../../services/tags.service';
declare var H: any;
// import { GeocoderService } from '../../services/geocoder.service';
import { filter } from "rxjs-compat/operator/filter";
@Component({
  selector: "app-add-user-profile",
  templateUrl: "./add-user-profile.component.html",
  styleUrls: ["./add-user-profile.component.css"]
})
export class AddUserProfileComponent implements OnInit, OnChanges {
  mode = "Add";
  userId: any;
  autoCompleteTags: any[] = [];
  tags = [];
  preTags: any = [];
  imageBlob: Blob;
  personas = [];
  public query: string;
  public query2: string;
  public platform: any;
  public geocoder: any;
  public locations: Array<any>;

  constructor(
    private userHandlerService: UserHandlerService,
    private apollo: Apollo,
    private router: Router,
    private route: ActivatedRoute,
    private imgUpload: FilesService,
    private auth: AuthService,
    // private here: GeocoderService,
    private tagService: TagsService,
  ) {
    // console.log("TEst is: ", this.test);
  }
  ngOnChanges() {
    this.platform = new H.service.Platform({
      app_id: "sug0MiMpvxIW4BhoGjcf",
      app_code: "GSl6bG5_ksXDw4sBTnhr_w"
    });
    this.geocoder = this.platform.getGeocodingService();
    this.query = " ";
    this.query2 = " ";
  }

  public getAddress() {
    if (this.userHandlerService.user.location != "") {
      // this.here.getAddress(this.userHandlerService.user.location).then(
      //   result => {
      //     this.locations = <Array<any>>result;
      //   },
      //   error => {
      //     console.error(error);
      //   }
      // );
    }
    var obj = this.userHandlerService.personas;
    console.log(this.userHandlerService.personas);
    var keys = Object.keys(obj);

    var filtered = keys.filter(function(key) {
      return obj[key];
    });
    console.log(JSON.parse("{" + filtered.toString() + "}"));
    console.log(typeof JSON.parse("{" + filtered.toString() + "}"));
  }
  public storeLocation(loc) {
    this.userHandlerService.user.location = loc.srcElement.innerText;
    console.log(this.userHandlerService.user.location);
  }
  ngOnInit() {
    this.tagService.getTagsFromDB();

    this.route.params.pipe(first()).subscribe(params => {
      console.log(params.id, "params id");
      if (params.id) {
        this.mode = "Edit";
        this.apollo
          .watchQuery<any>({
            query: gql`
          {
            users(where: { id: { _eq: ${params.id} } }) {
              id
              organization
              name
              qualification
              photo_url
              location
              phone_number
              personas
            }
          }
        `
          })
          .valueChanges.subscribe(result => {
            console.log("result", result);
            this.userHandlerService.user = result.data.users[0];

            if (this.userHandlerService.user.personas) {
              // this.userHandlerService.personas = this.userHandlerService.user.personas;
            }
          });
      }
    });

    this.apollo
      .watchQuery<any>({
        query: gql`
          {
            users(where: { id: { _eq: ${Number(this.auth.currentUserValue.id)} } }) {
              id
              user_tags{
                tag {
                  id
                  name
                }
              }
            }
          }`
      })
      .valueChanges.subscribe(result => {
        console.log(result, "result");

        this.tags = result.data.users[0].user_tags.map(tagArray => {
          console.log(tagArray, "work");

          return tagArray.tag.name;
        });
        console.log(this.tags, "tag");
        this.preTags = result.data.users[0].user_tags.map(tagArray => {
          console.log(tagArray, "work");

          return tagArray.tag;
        });
        console.log("tags==", this.tags);
      });
  }

  getBlob(event) {
    console.log("Event: ", event);
    this.imageBlob = event.target.files[0];
  }

  updateProfileToDb() {
    if (this.mode == "Add") {
      this.userHandlerService.updateUserInDb(
        Number(this.auth.currentUserValue.id),
        this.userHandlerService.user,
        this.tags
      );

      this.router.navigateByUrl("/profiles");
    } else if (this.mode == "Edit") {
      this.userHandlerService.updateUserInDb(
        this.userHandlerService.user.id,
        this.userHandlerService.user,
        this.preTags,
        this.tags
      );
    }
  }

  onSubmit() {
    // adding persona before submitting
    // this.userHandlerService.user.personas = this.userHandlerService.personas;

    if (this.imageBlob) {
      console.log("inside image blob");

      // Handle the image name if you want
      this.imgUpload
        .uploadFile(this.imageBlob, this.imageBlob["name"])
        .promise()
        .then(values => {
          // console.log("val: ", values);
          this.userHandlerService.user.photo_url = {};
          this.userHandlerService.user.photo_url.url = values["Location"];
          this.userHandlerService.user.photo_url.key = values["Key"];

          this.updateProfileToDb();
        })
        .catch(e => {
          console.log("Err:: ", e);
          this.updateProfileToDb();
        });
    } else {
      this.updateProfileToDb();
    }
  }
}
