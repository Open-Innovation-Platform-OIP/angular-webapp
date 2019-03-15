import { Component, OnInit, OnChanges } from "@angular/core";
import { UsersService } from "../../services/users.service";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Router, ActivatedRoute } from "@angular/router";
import { first, finalize } from "rxjs/operators";
import { AuthService } from "../../services/auth.service";
import { FilesService } from "../../services/files.service";
import { TagsService } from "../../services/tags.service";
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
  personas = ["testing"];
  public query: string;
  public query2: string;
  public platform: any;
  public geocoder: any;
  public locations: Array<any>;
  objectEntries = Object.entries;
  objectKeys = Object.keys;
  personaArray = [];

  user: any = {
    id: "",
    email: "",
    token: "",
    password: "",

    name: "",
    organization: "",

    qualification: "",
    photo_url: {},
    phone_number: "",
    location: "",
    is_ngo: false,
    is_innovator: false,
    is_expert: false,
    is_government: false,
    is_funder: false,
    is_beneficiary: false,
    is_incubator: false,
    is_entrepreneur: false
  };

  constructor(
    private userService: UsersService,
    private apollo: Apollo,
    private router: Router,
    private route: ActivatedRoute,
    private imgUpload: FilesService,
    private auth: AuthService,
    // private here: GeocoderService,
    private tagService: TagsService
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
    if (this.user.location != "") {
      // this.here.getAddress(this.user.location).then(
      //   result => {
      //     this.locations = <Array<any>>result;
      //   },
      //   error => {
      //     console.error(error);
      //   }
      // );
    }
    // var obj = personas;
    // console.log(personas);
    // var keys = Object.keys(obj);

    // var filtered = keys.filter(function(key) {
    //   return obj[key];
    // });
    // console.log(JSON.parse("{" + filtered.toString() + "}"));
    // console.log(typeof JSON.parse("{" + filtered.toString() + "}"));
  }
  public storeLocation(loc) {
    this.user.location = loc.srcElement.innerText;
    console.log(this.user.location);
  }
  ngOnInit() {
    Object.entries(this.user).map(persona => {
      if (typeof persona[1] === "boolean") {
        this.personaArray.push(persona[0].slice(3));
      }
    });
    // this.tagService.getTagsFromDB();

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
              is_ngo
              is_innovator
              is_entrepreneur
              is_expert
              is_government
              is_beneficiary
              is_incubator
              is_funder

              
            }
          }
        `
          })
          .valueChanges.subscribe(
            ({ data }) => {
              // console.log(data, "user profile");
              if (data.users.length > 0) {
                Object.keys(this.user).map(key => {
                  if (data.users[0][key]) {
                    this.user[key] = data.users[0][key];
                  }
                });
              }
              // });
            },
            error => {
              console.log("could not get user due to", error);
            }
          );
      }
    });

    // this.apollo
    //   .watchQuery<any>({
    //     query: gql`
    //       {
    //         users(where: { id: { _eq: ${Number(
    //           this.auth.currentUserValue.id
    //         )} } }) {
    //           id
    //           user_tags{
    //             tag {
    //               id
    //               name
    //             }
    //           }
    //         }
    //       }`
    //   })
    //   .valueChanges.subscribe(result => {
    //     console.log(result, "result");

    //     // this.tags = result.data.this.users[0].this.user_tags.map(tagArray => {
    //     //   console.log(tagArray, "work");

    //     //   return tagArray.tag.name;
    //     // });
    //     // console.log(this.tags, "tag");
    //     // this.preTags = result.data.this.users[0].this.user_tags.map(tagArray => {
    //     //   console.log(tagArray, "work");

    //     //   return tagArray.tag;
    //     // });
    //     console.log("tags==", this.tags);
    //   });
  }

  getBlob(event) {
    console.log("Event: ", event);
    this.imageBlob = event.target.files[0];
  }

  updateProfileToDb() {
    if (Number(this.auth.currentUserValue.id)) {
      this.user.id = Number(this.auth.currentUserValue.id);
    }
    this.userService.submitUserToDB(this.user);
  }

  onSubmit() {
    // adding persona before submitting
    // this.user.personas = personas;

    if (this.imageBlob) {
      console.log("inside image blob");

      // Handle the image name if you want
      this.imgUpload
        .uploadFile(this.imageBlob, this.imageBlob["name"])
        .promise()
        .then(values => {
          // console.log("val: ", values);
          this.user.photo_url = {};
          this.user.photo_url.url = values["Location"];
          this.user.photo_url.key = values["Key"];

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
