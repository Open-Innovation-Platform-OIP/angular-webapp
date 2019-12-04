import {
  Component,
  OnInit,
  OnChanges,
  ElementRef,
  ViewChild,
  Input,
  AfterViewInit
} from '@angular/core';

import { UsersService } from '../../services/users.service';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Router, ActivatedRoute } from '@angular/router';
import { first, take } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { FilesService } from '../../services/files.service';
import { TagsService } from '../../services/tags.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { GeocoderService } from '../../services/geocoder.service';
import { FormControl } from '@angular/forms';
import { FilterService } from '../../services/filter.service';
import {
  MatAutocompleteSelectedEvent,
  MatChipInputEvent,
  MatAutocomplete
} from '@angular/material';
import {
  FocusMonitor,
  LiveAnnouncer,
  AriaLivePoliteness
} from '@angular/cdk/a11y';

@Component({
  selector: 'app-add-user-profile',
  templateUrl: './add-user-profile.component.html',
  styleUrls: ['./add-user-profile.component.css']
})
export class AddUserProfileComponent
  implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('enterYourDetails') enterYourDetails: ElementRef<HTMLElement>;

  mode = 'Add';
  userId: any;
  visible = true;
  phone_pattern = new RegExp(
    '(?:(?:\\+|0{0,2})91(\\s*[\\- ]\\s*)?|[0 ]?)?[789]\\d{9}|(\\d[ -]?){10}\\d',
    'g'
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
    id: '',
    email: '',
    password: '',
    token: '',

    name: '',
    organization: '',
    qualification: '',
    photo_url: {},
    phone_number: '',

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
    organization_id: null,
    email_private: false,
    number_private: false,
    organization_private: false,
    interests_private: false,
    location_private: false,
    persona_private: false
  };

  @ViewChild('sectorInput') sectorInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    public userService: UsersService,
    private apollo: Apollo,
    private router: Router,
    private route: ActivatedRoute,
    public filesService: FilesService,
    private auth: AuthService,
    private here: GeocoderService,
    private tagService: TagsService,
    private geoService: GeocoderService,
    private focusMoniter: FocusMonitor,
    private liveAnnouncer: LiveAnnouncer,
    private filterService: FilterService
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

  ngAfterViewInit() {
    if (this.enterYourDetails) {
      this.focusMoniter.focusVia(this.enterYourDetails, 'program');
    }
  }

  announcement(message: string, politeness?: AriaLivePoliteness) {
    this.liveAnnouncer
      .announce(message, politeness)
      .then(x => x)
      .catch(e => console.error(e));
  }

  checkPersona(persona: string): boolean {
    const criteriaList = [
      'id',
      'email',
      'token',
      'password',
      'name',
      'organization',
      'qualification',
      'photo_url',
      'phone_number',
      'location',
      'notify_email',
      'notify_sms',
      'notify_app',
      'organization_id'
    ];

    for (const criteria of criteriaList) {
      if (persona === criteria) {
        return false;
      }
    }
    return true;
  }

  deleteProfileImage(image) {
    const fileName = image.fileEndpoint.split('/')[1];

    this.filesService.deleteFile(fileName).subscribe(
      result => {
        this.user.photo_url = {};
      },
      error => {
        console.error(error);
      }
    );
  }

  checkPhoneNumber(phone) {
    this.isPhoneValid = this.phone_pattern.test(phone);
  }

  add(event: MatChipInputEvent): void {
    // Add sector only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;
      // Add our sector
      if ((value || '').trim()) {
        this.sectors.push(value.trim().toUpperCase());
      }
      // Reset the input value
      if (input) {
        input.value = '';
      }
      this.sectorCtrl.setValue(null);
    }
  }

  remove(sector: string): void {
    this.announcement(`Removed ${sector}`);
    const index = this.sectors.indexOf(sector);
    if (index >= 0) {
      this.sectors.splice(index, 1);
      if (this.tagService.allTags[sector] && this.user.id) {
        this.tagService.removeTagRelation(
          this.tagService.allTags[sector].id,
          this.user.id,
          'users'
        );
      }
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const sectorName = event.option.viewValue;

    this.announcement(`Added ${sectorName}`);
    this.sectors.push(sectorName);
    this.sectorInput.nativeElement.value = '';
    this.sectorCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return Object.keys(this.tagService.allTags).filter(
      sector => sector.toLowerCase().indexOf(filterValue) === 0
    );
  }

  ngOnChanges() {}

  storeOrganization(event) {
    this.announcement(`selected ${event.value}`);
    this.user.organization_id = this.userService.allOrgs[this.organization].id;
  }

  getLocation(evt) {
    this.here.getAddress(this.userLocationName).then(
      result => {
        this.locations = <Array<any>>result;
        if (typeof evt === 'string') {
          this.announcement(`found ${this.locations.length} locations`);
        }
      },
      error => {
        console.error(error);
      }
    );
  }
  public storeLocation(event) {
    const locationData = event.option.value.Location;
    const matchType = event.option.value.MatchLevel;

    this.locationData = [];
    const coordinateArray = [
      locationData.DisplayPosition.Latitude,
      locationData.DisplayPosition.Longitude
    ];

    let location = {
      location: { type: 'Point', coordinates: coordinateArray },
      location_name: locationData.Address.Label,
      lat: coordinateArray[0],
      long: coordinateArray[1],
      type: matchType
    };
    if (locationData.Address.City) {
      location['city'] = locationData.Address.City;
    }
    if (locationData.Address.State) {
      location['state'] = locationData.Address.State;
    }
    if (locationData.Address.Country) {
      location['country'] = locationData.Address.Country;
    }

    this.userLocationName = locationData.Address.Label;
    this.locationData.push(location);
    this.announcement(`added ${this.userLocationName}`);
  }

  ngOnInit() {
    this.tagService.getTagsFromDB(this.filterService.domain_tags_query);

    Object.entries(this.user).map(persona => {
      if (typeof persona[1] === 'boolean') {
        this.personaArray.push(persona[0]);
      }
    });

    this.route.params.pipe(first()).subscribe(params => {
      if (params.id) {
        this.mode = 'Edit';
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
              email_private
              number_private
              organization_private
              interests_private
              location_private
              persona_private
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

            fetchPolicy: 'network-only'
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

                  this.userLocationName = userLocationFromDB.location_name;

                  this.prevLocation = userLocationFromDB;

                  this.locationData.push(userLocationFromDB);
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

  onValChange(event, type) {
    this.user[`${type}_private`] = event.checked;
  }

  updateProfileToDb() {
    if (Object.values(this.prevLocation).length) {
      if (this.prevLocation.location_name !== this.userLocationName) {
        this.geoService.removeLocationRelation(
          this.prevLocation.id,
          this.user['id'],
          'users'
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

        this.user['id'] = result.data.insert_users.returning[0].id;
        this.router.navigate(
          [`/profiles/${result.data.insert_users.returning[0].id}`],
          { queryParamsHandling: 'preserve' }
        );

        const tags = [];

        const users_tags = new Set();
        const user_location = new Set();
        if (this.locationData.length) {
          this.locationData.map(location => {
            if (
              this.geoService.allLocations[location.location_name] &&
              this.geoService.allLocations[location.location_name].id
            ) {
              user_location.add({
                location_id: this.geoService.allLocations[
                  location.location_name
                ].id,
                user_id: this.user['id']
              });
            }
          });
        }

        if (user_location.size > 0) {
          this.geoService.addRelationToLocations(
            this.user['id'],
            user_location,
            'users'
          );
        }

        if (this.locationData.length) {
          this.geoService.addLocationsInDB(
            this.locationData,
            'users',
            this.user['id']
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
              user_id: this.user['id']
            });
          }
        });

        this.tagService.addTagsInDb(tags, 'users', this.user['id']);

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
            .subscribe(
              data => {},
              err => {}
            );
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

    if (this.imageBlob) {
      // Handle the image name if you want
      this.filesService
        .fileUpload(this.imageBlob, this.imageBlob['type'])

        .then(values => {
          this.user.photo_url = {};
          this.user.photo_url.fileEndpoint = values['fileEndpoint'];
          this.user.photo_url.mimeType = this.imageBlob['type'];
          this.user.photo_url.key = values['key'];

          this.updateProfileToDb();
        })
        .catch(e => {
          console.error('Err:: ', e);
          this.updateProfileToDb();
        });
    } else {
      this.updateProfileToDb();
    }
  }
}
