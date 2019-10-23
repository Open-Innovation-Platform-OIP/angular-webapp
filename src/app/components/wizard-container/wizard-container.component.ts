import {
  Component,
  OnInit,
  Input,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  SimpleChanges,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild
} from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { TagsService } from '../../services/tags.service';
import { FilesService } from '../../services/files.service';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GeocoderService } from '../../services/geocoder.service';
// import { fileUploadVariables } from "../../../environments/environment";
import swal from 'sweetalert2';
// var Buffer = require('buffer/').Buffer;

import {
  FormControl,
  FormBuilder,
  FormGroupDirective,
  NgForm,
  Validators,
  FormGroup
} from '@angular/forms';
import { Content } from '@angular/compiler/src/render3/r3_ast';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
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
declare const $: any;

let canProceed: boolean;
const re = /(youtube|youtu|vimeo|dailymotion)\.(com|be)\/((watch\?v=([-\w]+))|(video\/([-\w]+))|(projects\/([-\w]+)\/([-\w]+))|([-\w]+))/;

interface FileReaderEventTarget extends EventTarget {
  result: string;
}

interface FileReaderEvent extends Event {
  target: EventTarget;
  getMessage(): string;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-wizard-container',
  templateUrl: './wizard-container.component.html',
  styleUrls: ['./wizard-container.component.css']
})
export class WizardContainerComponent
  implements OnInit, OnChanges, AfterViewInit {
  accessUrl: string;
  @Input() content;
  @Input() searchedResults: any[] = [];
  @Input() sectors: string[] = [];
  @Input() contentType: any;
  @Input() owners: any[] = [];
  @Input() selectedLocations = [];
  @Input() revertFocus = false;

  // @Input() canProceed: any = true;
  @Output() fieldsPopulated = new EventEmitter();
  @Output() smartSearchInput = new EventEmitter();
  @Output() changeFocus = new EventEmitter();
  @Output() tagAdded = new EventEmitter();
  @Output() tagRemoved = new EventEmitter();
  @Output() contentSubmitted = new EventEmitter();
  @Output() deleteDraft = new EventEmitter();
  @Output() addedOwners = new EventEmitter();
  @Output() removedOwners = new EventEmitter();
  @Output() locationSelected = new EventEmitter();
  @Output() locationRemoved = new EventEmitter();
  @Output() nextTab = new EventEmitter();

  file_types = [
    'application/msword',
    ' application/vnd.ms-excel',
    ' application/vnd.ms-powerpoint',
    'text/plain',
    ' application/pdf',
    ' image/*',
    'video/*'
  ];

  objectKeys = Object.keys;

  // locationCoordinates: any[] = [];

  localSectors: any[] = [];

  matcher = new MyErrorStateMatcher();
  type: FormGroup;
  is_edit = false;
  populationValue: Number;
  media_url = '';
  autosaveInterval: any;
  locations: any = [];
  locationInputValue: any;
  input_pattern = new RegExp('^s*');

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  searchResults = {};
  sectorCtrl = new FormControl();
  ownersCtrl = new FormControl();
  locationCtrl = new FormControl();
  filteredSectors: Observable<string[]>;
  filteredOwners: Observable<any[]>;

  tags = [];
  removable = true;
  sizes = [
    { value: 100, viewValue: '<100' },
    { value: 1000, viewValue: '<1000' },
    { value: 10000, viewValue: '<10000' },
    { value: 100000, viewValue: '<100,000' },
    { value: Number.MAX_VALUE, viewValue: '>100,000' }
  ];
  touch: boolean;

  @ViewChild('sectorInput') sectorInput: ElementRef<HTMLInputElement>;
  @ViewChild('locationInput') locationInput: ElementRef<HTMLInputElement>;
  @ViewChild('ownerInput') ownerInput: ElementRef<HTMLInputElement>;

  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private filesService: FilesService,
    private tagService: TagsService,
    private usersService: UsersService,
    private auth: AuthService,
    private here: GeocoderService,
    private elementRef: ElementRef,
    private focusMonitor: FocusMonitor,
    private liveAnnouncer: LiveAnnouncer
  ) {
    this.filteredSectors = this.sectorCtrl.valueChanges.pipe(
      startWith(null),
      map((sector: string | null) =>
        sector
          ? this._filter(sector)
          : Object.keys(this.tagService.allTags).slice()
      )
    );

    this.filteredOwners = this.ownersCtrl.valueChanges.pipe(
      startWith(null),
      map((owner: string | null) => (owner ? this.filterOwners(owner) : []))
    );

    // this.type = this.formBuilder.group({
    //   title: [null, Validators.required],
    //   description: [null, Validators.required],
    //   location: [null, Validators.required],
    //   population: [null, Validators.required],
    //   organization: [null, Validators.required],
    //   impact: [null, null],
    //   extent: [null, null],
    //   beneficiary: [null, null],
    //   resources: [null, null],
    //   sectors: [null, null],
    //   media_url: [null, null]
    // });
  }

  announcement(message: string, politeness?: AriaLivePoliteness) {
    this.liveAnnouncer
      .announce(message, politeness)
      .then(x => console.log('announced'))
      .catch(e => console.error(e));
  }

  add(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;
      // Add our sector
      if ((value || '').trim()) {
        this.localSectors.push(value.trim().toUpperCase());
      }
      // Reset the input value
      if (input) {
        input.value = '';
      }
      this.sectorCtrl.setValue(null);
      // this.tagAdded.emit(this.sectors);
    }
  }

  selectedLocation(event) {
    // this.content.location.push(event.option.value);

    const coordinateArray = [
      event.option.value.DisplayPosition.Latitude,
      event.option.value.DisplayPosition.Longitude
    ];

    const locationData = {
      location: { type: 'Point', coordinates: coordinateArray },
      location_name: event.option.value.Address.Label,
      lat: coordinateArray[0],
      long: coordinateArray[1]
    };

    this.selectedLocations.push(locationData);
    this.announcement(`Added ${locationData.location_name}`);

    // //console.log(this.selectedLocations, "selected locations");

    this.locationSelected.emit(this.selectedLocations);

    this.locationInput.nativeElement.value = '';
    this.locationCtrl.setValue(null);
  }

  addLocation(event) {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add our sector
      if ((value || '').trim()) {
        //console.log(value, "value location");
        // this.content.location.push(value);
      }
      // Reset the input value
      if (input) {
        input.value = '';
      }
      this.sectorCtrl.setValue(null);
      // this.tagAdded.emit(this.sectors);
    }
  }

  removeLocation(removedLocation) {
    // console.log(removedLocation, 'removed location');
    this.selectedLocations = this.selectedLocations.filter(location => {
      if (
        location.location.coordinates[0] !==
          removedLocation.location.coordinates[0] &&
        location.location.coordinates[1] !==
          removedLocation.location.coordinates[1]
      ) {
        return location;
      }
    });
    // const index = this.selectedLocations.indexOf(location);
    // if (index >= 0) {
    //   this.selectedLocations.splice(index, 1);
    // }
    // //console.log(this.selectedLocations, "selected locations after removal");

    this.locationRemoved.emit(removedLocation);
    this.announcement(`Remove ${removedLocation.location_name}`);
  }

  deleteClicked() {
    this.deleteDraft.emit(this.content.id);
  }

  remove(sector: string): void {
    console.log(sector, this.localSectors);
    const index = this.localSectors.indexOf(sector);
    if (index >= 0) {
      this.localSectors.splice(index, 1);
    }

    this.tagRemoved.emit(sector);

    this.announcement(`Removed ${sector}`);
  }

  getLocation() {
    if (this.locationInputValue !== 'Unknown') {
      this.here.getAddress(this.locationInputValue).then(
        result => {
          this.locations = <Array<any>>result;
          this.announcement(`Found ${this.locations.length} locations`);
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    // //console.log(this.sectors, "test for sector");
    this.localSectors.push(event.option.viewValue);
    this.sectorInput.nativeElement.value = '';
    this.sectorCtrl.setValue(null);
    this.announcement(`Added ${event.option.viewValue}`);
    this.tagAdded.emit(this.localSectors);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return Object.keys(this.tagService.allTags).filter(
      sector => sector.toLowerCase().indexOf(filterValue) === 0
    );
  }

  private filterOwners(value: String): any[] {
    if (typeof value === 'string') {
      //console.log(value, "value in filtered owners");
      const filterValue = value.toLowerCase();
      //console.log(filterValue, "value from filter");

      return Object.values(this.usersService.allUsers).filter(owner => {
        if (owner['value'].toLowerCase().indexOf(filterValue) === 0) {
          //console.log(owner, "owner", filterValue);
          return owner;
        }
      });
    }
  }

  selectedOwner(event: MatAutocompleteSelectedEvent): void {
    this.owners.push(event.option.value);
    this.ownerInput.nativeElement.value = '';
    this.ownersCtrl.setValue(null);
    this.addedOwners.emit(this.owners);
    this.announcement(`Added ${event.option.value.value}`);
  }

  removeOwner(owner) {
    const index = this.owners.indexOf(owner);
    if (index >= 0) {
      this.owners.splice(index, 1);
      this.removedOwners.emit(owner);
      this.announcement(`Removed ${owner.value || owner.name}`);
    }
  }

  addOwner(event) {
    //console.log(event, "event");
  }

  displayFieldCss(form: FormGroup, field: string) {
    return {
      'has-error': this.isFieldValid(form, field),
      'has-feedback': this.isFieldValid(form, field)
    };
  }

  isFieldValid(form: FormGroup, field: string) {
    return !form.get(field).valid && form.get(field).touched;
  }

  populationValueChanged(event) {
    if (event.value <= 100000) {
      this.content.min_population = 0;
      this.content.max_population = event.value;
    } else {
      this.content.min_population = 100000;
      this.content.max_population = Number.MAX_VALUE;
    }
  }

  ngOnInit() {
    // //console.log(
    //   this.content.locations,
    //   "wizard container locations",
    //   this.content
    // );
    // this.selectedLocations = this.content.locations;
    // this.accessUrl = fileUploadVariables.accessUrl;

    if (
      this.usersService.currentUser &&
      this.usersService.currentUser.organization
    ) {
      this.content.organization = this.usersService.currentUser.organization;
      // console.log(this.content.organization, "test orgs on user");
    } else {
      this.content.organization = 'none';
    }

    clearInterval(this.autosaveInterval);
    this.autosaveInterval = setInterval(() => {}, 10000);

    canProceed = true;

    this.usersService.getOrgsFromDB();
    this.type = this.formBuilder.group({
      // To add a validator, we must first convert the string value into an array.
      // The first tag in the array is the default value if any,
      // then the next tag in the array is the validator.
      // Here we are adding a required validator meaning that the firstName attribute must have a value in it.
      title: [null, Validators.required],
      description: [null, Validators.required],
      location: [null, Validators.required],
      population: [null, Validators.required],
      organization: [null, Validators.required],
      impact: [null, null],
      extent: [null, null],
      beneficiary: [null, null],
      resources: [null, null],
      sectors: [null, null],
      media_url: [null, null]
    });

    // Code for the Validator
    const $validator = $('.card-wizard form').validate({
      rules: {
        title: {
          required: true,
          minlength: 3
        },
        description: {
          required: true
        },
        organization: {
          required: true
        },
        location: {
          required: true
        },
        population: {
          required: true
        }
      },

      highlight: function(element) {
        $(element)
          .closest('.form-group')
          .removeClass('has-success')
          .addClass('has-danger');
      },
      success: function(element) {
        $(element)
          .closest('.form-group')
          .removeClass('has-danger')
          .addClass('has-success');
      },
      errorPlacement: function(error, element) {
        $(element).append(error);
      }
    });

    // Wizard Initialization
    $('.card-wizard').bootstrapWizard({
      tabClass: 'nav nav-pills',
      nextSelector: '.btn-next',
      previousSelector: '.btn-previous',

      onNext: function(tab, navigation, index) {
        window.scroll(0, 0);
        //console.log("next tab");
        this.nextTab.emit(true);

        const $valid = $('.card-wizard form').valid();
        if (!$valid) {
          $validator.focusInvalid();
          return false;
        } else if (!canProceed) {
          if (
            confirm(
              'Are you sure you want to add a new content and not enrich an existing one?'
            )
          ) {
            canProceed = true;

            return true;
          } else {
            return false;
          }
        }
      },

      onInit: function(tab: any, navigation: any, index: any) {
        let $total = navigation.find('li').length;
        const $wizard = navigation.closest('.card-wizard');

        const $first_li = navigation.find('li:first-child a').html();
        const $moving_div = $(
          '<div class="moving-tab">' + $first_li + '</div>'
        );
        $('.card-wizard .wizard-navigation').append($moving_div);

        $total = $wizard.find('.nav li').length;
        let $li_width = 100 / $total;

        const total_steps = $wizard.find('.nav li').length;
        let move_distance = $wizard.width() / total_steps;
        let index_temp = index;
        let vertical_level = 0;

        const mobile_device = $(document).width() < 600 && $total > 3;

        if (mobile_device) {
          move_distance = $wizard.width() / 2;
          index_temp = index % 2;
          $li_width = 50;
        }

        $wizard.find('.nav li').css('width', $li_width + '%');

        const step_width = move_distance;
        move_distance = move_distance * index_temp;

        const $current = index + 1;

        if ($current === 1 || (mobile_device === true && index % 2 === 0)) {
          move_distance -= 8;
        } else if (
          $current === total_steps ||
          (mobile_device === true && index % 2 === 1)
        ) {
          move_distance += 8;
        }

        if (mobile_device) {
          const x: any = index / 2;
          vertical_level = parseInt(x, 10);
          vertical_level = vertical_level * 38;
        }

        $wizard.find('.moving-tab').css('width', step_width);
        $('.moving-tab').css({
          transform:
            'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
          transition: 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'
        });
        $('.moving-tab').css('transition', 'transform 0s');
      },

      onTabClick: function(tab: any, navigation: any, index: any) {
        return true;
        const $valid = $('.card-wizard form').valid();

        if (!$valid) {
          return false;
        } else {
          return true;
        }
      },

      onTabShow: function(tab: any, navigation: any, index: any) {
        let $total = navigation.find('li').length;
        let $current = index + 1;

        const $wizard = navigation.closest('.card-wizard');

        // If it's the last tab then hide the last button and show the finish instead
        if ($current >= $total) {
          $($wizard)
            .find('.publish')
            .hide();
          $($wizard)
            .find('.btn-next')
            .hide();
          $($wizard)
            .find('.btn-finish')
            .show();
        } else {
          $($wizard)
            .find('.publish')
            .show();
          $($wizard)
            .find('.btn-next')
            .show();
          $($wizard)
            .find('.btn-finish')
            .show();
        }

        const button_text = navigation
          .find('li:nth-child(' + $current + ') a')
          .html();

        setTimeout(function() {
          $('.moving-tab').text(button_text);
        }, 150);

        const checkbox = $('.footer-checkbox');

        if (index !== 0) {
          $(checkbox).css({
            opacity: '0',
            visibility: 'hidden',
            position: 'absolute'
          });
        } else {
          $(checkbox).css({
            opacity: '1',
            visibility: 'visible'
          });
        }
        $total = $wizard.find('.nav li').length;
        let $li_width = 100 / $total;

        const total_steps = $wizard.find('.nav li').length;
        let move_distance = $wizard.width() / total_steps;
        let index_temp = index;
        let vertical_level = 0;

        const mobile_device = $(document).width() < 600 && $total > 3;

        if (mobile_device) {
          move_distance = $wizard.width() / 2;
          index_temp = index % 2;
          $li_width = 50;
        }

        $wizard.find('.nav li').css('width', $li_width + '%');

        const step_width = move_distance;
        move_distance = move_distance * index_temp;

        $current = index + 1;

        if ($current === 1 || (mobile_device === true && index % 2 === 0)) {
          move_distance -= 8;
        } else if (
          $current === total_steps ||
          (mobile_device === true && index % 2 === 1)
        ) {
          move_distance += 8;
        }

        if (mobile_device) {
          const x: any = index / 2;
          vertical_level = parseInt(x, 10);
          vertical_level = vertical_level * 38;
        }

        $wizard.find('.moving-tab').css('width', step_width);
        $('.moving-tab').css({
          transform:
            'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
          transition: 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'
        });
      }
    });

    // Prepare the preview for profile picture
    $('#wizard-picture').change(function() {
      const input = $(this);

      if (input[0].files && input[0].files[0]) {
        const reader = new FileReader();

        reader.onload = function(e: any) {
          $('#wizardPicturePreview')
            .attr('src', e.target.result)
            .fadeIn('slow');
        };
        reader.readAsDataURL(input[0].files[0]);
      }
    });

    $('[data-toggle="wizard-radio"]').click(function() {
      const wizard = $(this).closest('.card-wizard');
      wizard.find('[data-toggle="wizard-radio"]').removeClass('active');
      $(this).addClass('active');
      $(wizard)
        .find('[type="radio"]')
        .removeAttr('checked');
      $(this)
        .find('[type="radio"]')
        .attr('checked', 'true');
    });

    $('[data-toggle="wizard-checkbox"]').click(function() {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $(this)
          .find('[type="checkbox"]')
          .removeAttr('checked');
      } else {
        $(this).addClass('active');
        $(this)
          .find('[type="checkbox"]')
          .attr('checked', 'true');
      }
    });
    $('.set-full-height').css('height', 'auto');
  }

  ngOnChanges(changes: SimpleChanges) {
    // Revert focus
    if (this.contentType === 'problem' && this.revertFocus) {
      this.setFocus('input[name="title"]');
    } else if (this.contentType === 'enrichment' && this.revertFocus) {
      this.setFocus('textarea[name="description"]');
    }

    if (this.localSectors.length <= this.sectors.length) {
      // console.log(this.localSectors, ">>>>> local sectors ");
      this.localSectors = this.sectors;
      // //console.log(
      //   this.localSectors,
      //   "local sectors on ng on change",
      //   this.sectors
      // );
    } else {
      // //console.log(
      //   this.localSectors,
      //   "local sectors on ng on change",
      //   "sectors from parent==",
      //   this.sectors
      // );
    }

    //console.log("wizard container ngonchanges", this.selectedLocations);

    const input = $(this);
    if (input[0].files && input[0].files[0]) {
      const reader: any = new FileReader();
      reader.onload = function(e: any) {
        $('#wizardPicturePreview')
          .attr('src', e.target.result)
          .fadeIn('slow');
      };
      reader.readAsDataURL(input[0].files[0]);
    }
  }

  sendInputToParent(input) {
    // //console.log(event, "test for event");
    this.smartSearchInput.emit(input);
  }

  checkForSpaces($event) {}

  publishContent() {
    console.log(this.content, 'content');
    this.contentSubmitted.emit(this.content);
  }

  sendDataBack() {
    this.fieldsPopulated.emit(this.content);
  }

  ngAfterViewInit() {
    $(window).resize(() => {
      $('.card-wizard').each(function() {
        const $wizard = $(this);
        const index = $wizard.bootstrapWizard('currentIndex');
        const $total = $wizard.find('.nav li').length;
        let $li_width = 100 / $total;

        const total_steps = $wizard.find('.nav li').length;
        let move_distance = $wizard.width() / total_steps;
        let index_temp = index;
        let vertical_level = 0;

        const mobile_device = $(document).width() < 600 && $total > 3;

        if (mobile_device) {
          move_distance = $wizard.width() / 2;
          index_temp = index % 2;
          $li_width = 50;
        }

        $wizard.find('.nav li').css('width', $li_width + '%');

        const step_width = move_distance;
        move_distance = move_distance * index_temp;

        const $current = index + 1;

        if ($current === 1 || (mobile_device === true && index % 2 === 0)) {
          move_distance -= 8;
        } else if (
          $current === total_steps ||
          (mobile_device === true && index % 2 === 1)
        ) {
          move_distance += 8;
        }

        if (mobile_device) {
          const x: any = index / 2;
          vertical_level = parseInt(x, 10);
          vertical_level = vertical_level * 38;
        }

        $wizard.find('.moving-tab').css('width', step_width);
        $('.moving-tab').css({
          transform:
            'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
          transition: 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'
        });

        $('.moving-tab').css({
          transition: 'transform 0s'
        });
      });
    });

    setTimeout(() => {
      this.setFocus('h1.card-title');
    }, 1000);
  }

  setFocus(elemId) {
    const elm = this.elementRef.nativeElement.querySelector(elemId);

    if (elm) {
      this.focusMonitor.focusVia(elm, 'program');
    }
  }

  removeSelectedItem(type: string, index: number) {
    let fileName;
    switch (type) {
      case 'image':
        // //console.log(
        //   this.content.image_urls[index],
        //   "deleted image",
        //   this.content.featured_url
        // );

        if (
          this.content.image_urls[index].fileEndpoint ==
          this.content.featured_url
        ) {
          this.content.featured_url = '';
          this.content.featured_type = '';
          console.log(this.content.featured_url, 'content featured');
          console.log(this.content, 'content');
        }
        fileName = this.content.image_urls[index].fileEndpoint.split('/')[1];
        this.filesService.deleteFile(fileName).subscribe(
          result => console.log(result),
          error => {
            console.log(error);
          }
        );
        this.content.image_urls.splice(index, 1);

        this.setDefaultFeaturedImage();
        break;

      case 'video':
        if (
          this.content.video_urls[index].fileEndpoint ===
          this.content.featured_url
        ) {
          this.content.featured_url = '';
          this.content.featured_type = '';
        }
        this.content.video_urls.splice(index, 1);
        fileName = this.content.video_urls[index].fileEndpoint.split('/')[1];
        this.filesService.deleteFile(fileName);
        break;

      case 'embed':
        this.content.embed_urls.splice(index, 1);
        if (this.content.embed_urls[index] === this.content.featured_url) {
          this.content.featured_url = '';
          this.content.featured_type = '';
        }
        // fileName = this.content.image_urls[index].fileEndpoint.split("/")[1];
        // this.filesService.deleteFile(fileName);
        break;

      case 'link':
        this.content.attachments.splice(index, 1);
        fileName = this.content.attachments[index].fileEndpoint.split('/')[1];
        this.filesService.deleteFile(fileName);
        break;

      default:
        //console.log("remove item default case");
        break;
    }
  }

  setDefaultFeaturedImage() {
    if (!this.content.featured_url && this.content.image_urls.length) {
      //console.log(this.content.image_urls[0].fileEndpoint, "deafault");
      this.content.featured_url = this.content.image_urls[0].fileEndpoint;
      this.content.featured_type = 'image';
      console.log(this.content, 'default contetn');
    }
  }

  checkIfExist(data: string) {
    let problem_attachments = [
      ...this.content['image_urls'],
      ...this.content['video_urls'],
      ...this.content['attachments']
    ];

    let checked = problem_attachments.filter(attachmentObj => {
      return attachmentObj.key === data;
    });

    if (checked.length > 0) {
      return true;
    } else if (this.content.embed_urls.includes(data)) {
      return true;
    } else {
      return false;
    }
  }

  onFileSelected(event) {
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      const type = event.target.files[i].type.split('/')[0];
      const mimeType = event.target.files[i].type;
      const size = file.size;

      if (size > 5e6) {
        alert('File size exceeds the 5MB limit');
        return;
      }

      switch (type) {
        case 'image': {
          if (typeof FileReader !== 'undefined') {
            const reader = new FileReader();

            reader.onload = (e: any) => {
              const img_id = file.name;
              this.filesService
                .fileUpload(file, mimeType)
                .then(values => {
                  this.content.image_urls.push({
                    fileEndpoint: values['fileEndpoint'],
                    mimeType: event.target.files[i].type,
                    key: values['key']
                  });
                  if (!this.content.featured_url) {
                    this.content.featured_url = this.content.image_urls[0].fileEndpoint;
                    this.content.featured_type = 'image';
                  }
                })
                .catch(e => {});
            };
            reader.readAsArrayBuffer(file);
          }
          break;
        }
        case 'video': {
          const video = event.target.files[i];
          this.filesService
            .fileUpload(video, mimeType)

            .then(values => {
              this.content.video_urls.push({
                fileEndpoint: values['fileEndpoint'],
                mimeType: event.target.files[i].type,
                key: values['key']
              });
            })
            .catch(e => {});
          break;
        }
        case 'application':
        case 'text': {
          const doc = event.target.files[i];
          this.filesService
            .fileUpload(doc, mimeType)

            .then(values => {
              this.content.attachments.push({
                fileEndpoint: values['fileEndpoint'],
                mimeType: event.target.files[i].type,
                key: values['key']
              });
            })
            .catch(e => {});
          break;
        }
        default: {
          // console.log('unknown file type');
          alert('Unknown file type.');
          break;
        }
      }
    }
  }

  nextSelected() {
    const tabUpload = this.elementRef.nativeElement.querySelector(
      '[href="#media"]'
    );

    this.focusMonitor.focusVia(tabUpload, 'program');
    this.nextTab.emit(true);
  }

  prevSelected() {
    const nextBtn = this.elementRef.nativeElement.querySelector(
      'input.btn-next'
    );

    if (!nextBtn.disabled) {
      setTimeout(() => {
        this.focusMonitor.focusVia(nextBtn, 'program');
      }, 1000);
    } else {
      const tab = this.elementRef.nativeElement.querySelector('[href="#text"]');
      this.focusMonitor.focusVia(tab, 'program');
    }
  }

  isComplete() {
    if (this.contentType === 'problem') {
      return (
        this.content.title &&
        this.content.description &&
        this.content.organization &&
        this.localSectors.length &&
        // this.content.min_population &&
        this.content.max_population

        // &&
        // this.content.location.length
      );
    } else {
      return (
        this.content.description &&
        this.content.organization &&
        this.content.max_population
        // &&
        // this.content.location.length
      );
    }
  }

  setFeatured(type, index) {
    // //console.log(type, index);
    if (type === 'image') {
      this.content.featured_type = 'image';
      this.content.featured_url = this.content.image_urls[index].fileEndpoint;
    } else if (type === 'video') {
      this.content.featured_type = 'video';
      this.content.featured_url = this.content.video_urls[index].fileEndpoint;
    } else if (type === 'embed') {
      this.content.featured_type = 'embed';
      this.content.featured_url = this.content.embed_urls[index];
    }
  }

  addMediaUrl() {
    let duplicate = this.checkIfExist(this.media_url);

    if (this.media_url && !duplicate) {
      this.content.embed_urls.push(this.media_url);
      this.media_url = '';
      if (!this.content.featured_url) {
        this.content.featured_url = this.media_url;
        this.content.featured_type = 'embed';
      }
    }
    if (duplicate) {
      alert('Link already exist.');
    }
  }

  checkMedialUrl(url: string) {
    if (!url.startsWith('http')) {
      return false;
    }

    if (url.match(re)) {
      return true;
    } else {
      return false;
    }
  }

  moveFocus() {
    this.changeFocus.emit(true);
  }
}
