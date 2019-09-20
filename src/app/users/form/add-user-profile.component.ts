import {
  Component,
  OnInit,
  OnChanges,
  ElementRef,
  ViewChild,
  Input
} from "@angular/core";
import { ErrorStateMatcher } from "@angular/material/core";

import { UsersService } from "../../services/users.service";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Router, ActivatedRoute } from "@angular/router";
import { first, finalize, take } from "rxjs/operators";
import { AuthService } from "../../services/auth.service";
import { FilesService } from "../../services/files.service";
import { TagsService } from "../../services/tags.service";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { GeocoderService } from "../../services/geocoder.service";

import {
  FormControl,
  FormBuilder,
  FormGroupDirective,
  NgForm,
  Validators,
  FormGroup
} from "@angular/forms";
import {
  MatAutocompleteSelectedEvent,
  MatChipInputEvent,
  MatAutocomplete
} from "@angular/material";
// declare var H: any;
// import { GeocoderService } from '../../services/geocoder.service';
import { filter } from "rxjs-compat/operator/filter";

// export class MyErrorStateMatcher implements ErrorStateMatcher {
//   isErrorState(
//     control: FormControl | null,
//     form: FormGroupDirective | NgForm | null
//   ): boolean {
//     const isSubmitted = form && form.submitted;
//     return !!(
//       control &&
//       control.invalid &&
//       (control.dirty || control.touched || isSubmitted)
//     );
//   }
// }
@Component({
  selector: "app-add-user-profile",
  templateUrl: "./add-user-profile.component.html",
  styleUrls: ["./add-user-profile.component.css"]
})
export class AddUserProfileComponent implements OnInit, OnChanges {
  mode = "Add";
  userId: any;
  visible = true;
  phone_pattern = new RegExp(
    "(?:(?:\\+|0{0,2})91(\\s*[\\- ]\\s*)?|[0 ]?)?[789]\\d{9}|(\\d[ -]?){10}\\d",
    "g"
  );
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  autoCompleteTags: any[] = [];
  searchResults = {};
  sectorCtrl = new FormControl();
  filteredSectors: Observable<string[]>;
  sectors: any = [];
  tags = [];
  preTags: any = [];
  imageBlob: Blob;
  isPhoneValid = false;
  personas: any = [];
  public query: string;
  public query2: string;
  public platform: any;
  public geocoder: any;
  public locations: Array<any>;
  objectEntries = Object.entries;
  objectKeys = Object.keys;
  personaArray = [];
  organization: any = {};
  userLocationName: any;
  locationData = [];
  prevLocation: any = {};

  user: any = {
    id: "",
    email: "",
    password: "",
    token: "",

    name: "",
    organization: "",
    qualification: "",
    photo_url: {},
    phone_number: "",

    is_ngo: false,
    is_innovator: false,
    is_expert: false,
    is_government: false,
    is_funder: false,
    is_beneficiary: false,
    is_incubator: false,
    is_entrepreneur: false,
    notify_email: false,
    notify_sms: false,
    notify_app: true,
    organization_id: null
  };

  @ViewChild("sectorInput") sectorInput: ElementRef<HTMLInputElement>;
  @ViewChild("auto") matAutocomplete: MatAutocomplete;

  constructor(
    private userService: UsersService,
    private apollo: Apollo,
    private router: Router,
    private route: ActivatedRoute,
    private filesService: FilesService,
    private auth: AuthService,
    private here: GeocoderService,
    private tagService: TagsService,
    private geoService: GeocoderService
  ) {
    this.filteredSectors = this.sectorCtrl.valueChanges.pipe(
      startWith(null),
      map((sector: string | null) =>
        sector
          ? this._filter(sector)
          : Object.keys(this.tagService.allTags).slice()
      )
    );
  }

  checkPhoneNumber(phone) {
    console.log("pn>>>> ", phone);

    this.isPhoneValid = this.phone_pattern.test(phone);
  }

  add(event: MatChipInputEvent): void {
    // Add sector only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;
      // Add our sector
      if ((value || "").trim()) {
        this.sectors.push(value.trim().toUpperCase());
      }
      // Reset the input value
      if (input) {
        input.value = "";
      }
      this.sectorCtrl.setValue(null);
    }
  }

  remove(sector: string): void {
    const index = this.sectors.indexOf(sector);
    if (index >= 0) {
      this.sectors.splice(index, 1);
      if (this.tagService.allTags[sector] && this.user.id) {
        this.tagService.removeTagRelation(
          this.tagService.allTags[sector].id,
          this.user.id,
          "users"
        );
      }

      // this.apollo
      //   .mutate<any>({
      //     mutation: gql`
      //       mutation DeleteMutation($where: users_tags_bool_exp!) {
      //         delete_users_tags(where: $where) {
      //           affected_rows
      //           returning {
      //             tag_id
      //           }
      //         }
      //       }
      //     `,
      //     variables: {
      //       where: {
      //         tag_id: {
      //           _eq: this.tagService.allTags[sector].id
      //         },
      //         user_id: {
      //           _eq: this.user.id
      //         }
      //       }
      //     }
      //   })
      //   .subscribe(
      //     ({ data }) => {
      //       console.log("worked", data);
      //       // location.reload();
      //       // location.reload();
      //       // this.router.navigateByUrl("/problems");

      //       return;
      //     },
      //     error => {
      //       console.log("Could delete due to " + error);
      //     }
      //   );
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.sectors.push(event.option.viewValue);
    this.sectorInput.nativeElement.value = "";
    this.sectorCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return Object.keys(this.tagService.allTags).filter(
      sector => sector.toLowerCase().indexOf(filterValue) === 0
    );
  }

  ngOnChanges() {
    // this.platform = new H.service.Platform({
    //   app_id: "sug0MiMpvxIW4BhoGjcf",
    //   app_code: "GSl6bG5_ksXDw4sBTnhr_w"
    // });
    // this.geocoder = this.platform.getGeocodingService();
    // this.query = " ";
    // this.query2 = " ";
  }

  storeOrganization(event) {
    this.user.organization_id = this.userService.allOrgs[this.organization].id;
  }

  getLocation() {
    this.here.getAddress(this.userLocationName).then(
      result => {
        this.locations = <Array<any>>result;
      },
      error => {
        console.error(error);
      }
    );

    // var obj = personas;
    // console.log(personas);
    // var keys = Object.keys(obj);

    // var filtered = keys.filter(function(key) {
    //   return obj[key];
    // });
    // console.log(JSON.parse("{" + filtered.toString() + "}"));
    // console.log(typeof JSON.parse("{" + filtered.toString() + "}"));
  }
  public storeLocation(event) {
    // this.user.location = location.option.value;
    this.locationData = [];
    const coordinateArray = [
      event.option.value.DisplayPosition.Latitude,
      event.option.value.DisplayPosition.Longitude
    ];

    const location = {
      location: { type: "Point", coordinates: coordinateArray },
      location_name: event.option.value.Address.Label,
      lat: coordinateArray[0],
      long: coordinateArray[1]
    };

    this.userLocationName = event.option.value.Address.Label;
    this.locationData.push(location);
    // console.log(this.locationData, "location data");
  }

  ngOnInit() {
    this.tagService.getTagsFromDB();

    Object.entries(this.user).map(persona => {
      if (typeof persona[1] === "boolean") {
        this.personaArray.push(persona[0]);
      }
    });

    this.route.params.pipe(first()).subscribe(params => {
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
              email
              qualification
              photo_url

              user_locations{
                location{
                  id
                  location_name
                  location
                  lat
                  long
              
                }

              }
              
              phone_number
              is_ngo
              is_innovator
              is_entrepreneur
              is_expert
              is_government
              is_beneficiary
              is_incubator
              is_funder
              notify_email
              notify_sms
              notify_app
              organization_id
              organizationByOrganizationId{
                id
                name
              }
              users_tags{
                tag {
                    id
                    name
                }
            }
            }
        }

              
           
        `,

            fetchPolicy: "network-only"
            // pollInterval: 500
          })
          .valueChanges.pipe(take(1))
          .subscribe(
            ({ data }) => {
              if (data.users.length > 0) {
                Object.keys(this.user).map(key => {
                  if (data.users[0][key]) {
                    this.user[key] = data.users[0][key];
                  }
                });

                if (data.users[0].user_locations.length) {
                  const userLocationFromDB =
                    data.users[0].user_locations[0].location;
                  delete userLocationFromDB.__typename;
                  console.log(data.users[0].user_locations, "user locations");
                  this.userLocationName = userLocationFromDB.location_name;

                  this.prevLocation = userLocationFromDB;

                  this.locationData.push(userLocationFromDB);
                  console.log(this.locationData, "location data ng on it");
                }

                if (data.users[0].organizationByOrganizationId) {
                  this.organization =
                    data.users[0].organizationByOrganizationId.name;
                }
              }

              this.isPhoneValid = this.phone_pattern.test(
                this.user.phone_number
              );
              this.sectors = data.users[0].users_tags.map(tagArray => {
                return tagArray.tag.name;
              });
            },
            error => {
              console.log("could not get user due to", error);
              console.error(JSON.stringify(error));
            }
          );
      }
    });
  }

  getBlob(event) {
    this.imageBlob = event.target.files[0];
  }

  removeDuplicates(array) {
    return Array.from(new Set(array));
  }

  updateProfileToDb() {
    if (Object.values(this.prevLocation).length) {
      if (this.prevLocation.location_name !== this.userLocationName) {
        this.geoService.removeLocationRelation(
          this.prevLocation.id,
          this.user["id"],
          "users"
        );
      }
    }
    this.sectors = this.removeDuplicates(this.sectors);
    this.user.phone_number = this.user.phone_number.toString();
    if (Number(this.auth.currentUserValue.id)) {
      this.user.id = Number(this.auth.currentUserValue.id);
    }

    if (this.personas) {
      this.personas.map(persona => {
        this.user[persona] = true;
      });
    }

    if (this.user.organization) {
      this.userService.allUsers[
        Number(this.auth.currentUserValue.id)
      ].organization = this.user.organization;
    }

    this.userService.submitUserToDB(this.user).subscribe(
      result => {
        this.userService.getCurrentUser();

        this.user["id"] = result.data.insert_users.returning[0].id;
        this.router.navigate(
          [`/profiles/${result.data.insert_users.returning[0].id}`],
          { queryParamsHandling: "preserve" }
        );

        const tags = [];

        const users_tags = new Set();
        const user_location = new Set();
        if (this.locationData.length) {
          this.locationData.map(location => {
            // const locationUniqueId =
            //   location.lat.toString() + location.long.toString();
            if (
              this.geoService.allLocations[location.location_name] &&
              this.geoService.allLocations[location.location_name].id
            ) {
              user_location.add({
                location_id: this.geoService.allLocations[
                  location.location_name
                ].id,
                user_id: this.user["id"]
              });
            }
          });
        }

        if (user_location.size > 0) {
          this.geoService.addRelationToLocations(
            this.user["id"],
            user_location,
            "users"
          );
        }

        if (this.locationData.length) {
          this.geoService.addLocationsInDB(
            this.locationData,
            "users",
            this.user["id"]
          );
        }

        this.sectors.map(sector => {
          tags.push({ name: sector });

          if (
            this.tagService.allTags[sector] &&
            this.tagService.allTags[sector].id
          ) {
            users_tags.add({
              tag_id: this.tagService.allTags[sector].id,
              user_id: this.user["id"]
            });
          }
        });

        this.tagService.addTagsInDb(tags, "users", this.user["id"]);

        if (users_tags.size > 0) {
          const upsert_users_tags = gql`
            mutation upsert_users_tags(
              $users_tags: [users_tags_insert_input!]!
            ) {
              insert_users_tags(
                objects: $users_tags
                on_conflict: {
                  constraint: users_tags_pkey
                  update_columns: [tag_id, user_id]
                }
              ) {
                affected_rows
                returning {
                  tag_id
                  user_id
                }
              }
            }
          `;
          this.apollo
            .mutate({
              mutation: upsert_users_tags,
              variables: {
                users_tags: Array.from(users_tags)
              }
            })
            .pipe(take(1))
            .subscribe(data => {}, err => {});
        }
      },
      err => {
        console.error(JSON.stringify(err));
      }
    );

    this.personas = [];
  }

  onSubmit() {
    // adding persona before submitting
    // this.user.personas = personas;

    if (this.imageBlob) {
      console.log("inside image blob");

      // Handle the image name if you want
      this.filesService
        .fileUpload(this.imageBlob, this.imageBlob["type"])

        .then(values => {
          console.log(values, "user values");
          this.user.photo_url = {};
          this.user.photo_url.fileEndpoint = values["fileEndpoint"];
          this.user.photo_url.mimeType = this.imageBlob["type"];
          this.user.photo_url.key = this.imageBlob["name"];

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
