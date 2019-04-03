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
} from "@angular/core";
import { ErrorStateMatcher } from "@angular/material/core";
import { TagsService } from "../../services/tags.service";
import { FilesService } from "../../services/files.service";
import { UsersService } from "../../services/users.service";
import { AuthService } from "../../services/auth.service";
import { Router, ActivatedRoute } from "@angular/router";
import { map, startWith } from "rxjs/operators";
import { Observable } from "rxjs";
import { GeocoderService } from "../../services/geocoder.service";
import swal from "sweetalert2";

import {
  FormControl,
  FormBuilder,
  FormGroupDirective,
  NgForm,
  Validators,
  FormGroup
} from "@angular/forms";
import { Content } from "@angular/compiler/src/render3/r3_ast";

import { COMMA, ENTER } from "@angular/cdk/keycodes";
import {
  MatAutocompleteSelectedEvent,
  MatChipInputEvent,
  MatAutocomplete
} from "@angular/material";
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

// import { Content } from '@angular/compiler/src/render3/r3_ast';

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
  selector: "app-wizard-container",
  templateUrl: "./wizard-container.component.html",
  styleUrls: ["./wizard-container.component.css"]
})
export class WizardContainerComponent
  implements OnInit, OnChanges, AfterViewInit {
  @Input() content;

  @Input() sectors: string[] = [];
  @Input() contentType: any;
  // @Input() canProceed: any = true;
  @Output() fieldsPopulated = new EventEmitter();
  @Output() smartSearchInput = new EventEmitter();
  @Output() tagAdded = new EventEmitter();
  @Output() tagRemoved = new EventEmitter();
  @Output() contentSubmitted = new EventEmitter();

  file_types = [
    "application/msword",
    " application/vnd.ms-excel",
    " application/vnd.ms-powerpoint",
    "text/plain",
    " application/pdf",
    " image/*",
    "video/*"
  ];

  localSectors: any[]=[];
  matcher = new MyErrorStateMatcher();
  type: FormGroup;
  is_edit = false;
  populationValue: Number;
  media_url = "";
  autosaveInterval: any;
  locations: any = [];
  locationInputValue: any;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  searchResults = {};
  sectorCtrl = new FormControl();
  locationCtrl = new FormControl();
  filteredSectors: Observable<string[]>;
  // sectors: string[] = [];
  tags = [];
  removable = true;
  sizes = [
    { value: 100, viewValue: "<100" },
    { value: 1000, viewValue: "<1000" },
    { value: 10000, viewValue: "<10000" },
    { value: 100000, viewValue: "<100,000" },
    { value: Number.MAX_VALUE, viewValue: ">100,000" }
  ];
  touch: boolean;

  @ViewChild("sectorInput") sectorInput: ElementRef<HTMLInputElement>;
  @ViewChild("locationInput") locationInput: ElementRef<HTMLInputElement>;

  @ViewChild("auto") matAutocomplete: MatAutocomplete;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private filesService: FilesService,
    private tagService: TagsService,
    private usersService: UsersService,
    private auth: AuthService,
    private here: GeocoderService
  ) {
    
   
    this.filteredSectors = this.sectorCtrl.valueChanges.pipe(
      startWith(null),
      map((sector: string | null) =>
        sector
          ? this._filter(sector)
          : Object.keys(this.tagService.allTags).slice()
      )
    );

    this.type = this.formBuilder.group({
      
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
  }

  add(event: MatChipInputEvent): void {
    // Add sector only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;
      // Add our sector
      if ((value || "").trim()) {
        this.localSectors.push(value.trim().toUpperCase());
      }
      // Reset the input value
      if (input) {
        input.value = "";
      }
      this.sectorCtrl.setValue(null);
      // this.tagAdded.emit(this.sectors);
    }
  }

  selectedLocation(event) {
    this.content.location.push(event.option.value);
    // console.log(this.content.location, "selected location content 2");

    this.locationInput.nativeElement.value = "";
    this.locationCtrl.setValue(null);
    // this.tagAdded.emit(this.sectors);
  }

  addLocation(event) {
    if (!this.matAutocomplete.isOpen) {
      // console.log(event, "event for add ");
      const input = event.input;
      const value = event.value;

      // Add our sector
      if ((value || "").trim()) {
        this.content.location.push(value);
      }
      // Reset the input value
      if (input) {
        input.value = "";
      }
      this.sectorCtrl.setValue(null);
      // this.tagAdded.emit(this.sectors);
    }
  }

  removeLocation(location) {
    const index = this.content.location.indexOf(location);
    if (index >= 0) {
      this.content.location.splice(index, 1);
    }
  }

  // sendTagsToParent(tags) {
  //   this.tagsChanged.emit(this.sectors);
  // }

  remove(sector: string): void {
    const index = this.localSectors.indexOf(sector);
    if (index >= 0) {
      this.localSectors.splice(index, 1);
    }

    this.tagRemoved.emit(sector);

    // this.tagsChanged.emit(this.sectors);
  }

  getLocation(input) {
    // console.log("get address", input);
    if (this.locationInputValue != "Unknown") {
      this.here.getAddress(this.locationInputValue).then(
        result => {
          // console.log(result, "result");
          this.locations = <Array<any>>result;
          // console.log(this.locations, "locations");
        },
        error => {
          console.error(error);
        }
      );
    }

  
  }
  public storeLocation(loc) {
    // this.content.location = loc.srcElement.innerText;
    // console.log(loc, "location");
    // console.log(this..location);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    // console.log(this.sectors, "test for sector");
    this.localSectors.push(event.option.viewValue);
    this.sectorInput.nativeElement.value = "";
    this.sectorCtrl.setValue(null);
    this.tagAdded.emit(this.localSectors);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return Object.keys(this.tagService.allTags).filter(
      sector => sector.toLowerCase().indexOf(filterValue) === 0
    );
  }

  displayFieldCss(form: FormGroup, field: string) {
    return {
      "has-error": this.isFieldValid(form, field),
      "has-feedback": this.isFieldValid(form, field)
    };
  }

  isFieldValid(form: FormGroup, field: string) {
    return !form.get(field).valid && form.get(field).touched;
  }

  populationValueChanged(event) {
    // console.log(event, "event");
    if (event.value <= 100000) {
      this.content.min_population = 0;
      this.content.max_population = event.value;
    } else {
      this.content.min_population = 100000;
      this.content.max_population = Number.MAX_VALUE;
    }
  }

  ngOnInit() {
    console.log(this.localSectors, "wizard ngoninit sectors");
    if (
      this.usersService.allUsers[this.auth.currentUserValue.id] &&
      this.usersService.allUsers[this.auth.currentUserValue.id].organization
    ) {
      this.content.organization = this.usersService.allUsers[
        this.auth.currentUserValue.id
      ].organization;
    } else {
      this.content.organization = "None";
    }

    // if(this.content.problem_tags)
    // if (this.content.max_population > 0) {

    // console.log(this.content, "content");
    clearInterval(this.autosaveInterval);
    this.autosaveInterval = setInterval(() => {
      // this.autoSave();
    }, 10000);

    // console.log(this.usersService.allOrgs, "orgs");

    canProceed = true;
    // console.log("wizard ngoninit");

    // console.log(this.content, "test for cont");
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
    const $validator = $(".card-wizard form").validate({
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
          .closest(".form-group")
          .removeClass("has-success")
          .addClass("has-danger");
      },
      success: function(element) {
        $(element)
          .closest(".form-group")
          .removeClass("has-danger")
          .addClass("has-success");
      },
      errorPlacement: function(error, element) {
        $(element).append(error);
      }
    });

    // Wizard Initialization
    $(".card-wizard").bootstrapWizard({
      tabClass: "nav nav-pills",
      nextSelector: ".btn-next",
      previousSelector: ".btn-previous",

      onNext: function(tab, navigation, index) {
        const $valid = $(".card-wizard form").valid();
        if (!$valid) {
          $validator.focusInvalid();
          return false;
        } else if (!canProceed) {
          if (
            confirm(
              "Are you sure you want to add a new content and not enrich an existing one?"
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
        // this.populationValue = this.content.max_population;
        // console.log("wizard oninit");

        // check number of tabs and fill the entire row
        let $total = navigation.find("li").length;
        const $wizard = navigation.closest(".card-wizard");

        const $first_li = navigation.find("li:first-child a").html();
        const $moving_div = $(
          '<div class="moving-tab">' + $first_li + "</div>"
        );
        $(".card-wizard .wizard-navigation").append($moving_div);

        $total = $wizard.find(".nav li").length;
        let $li_width = 100 / $total;

        const total_steps = $wizard.find(".nav li").length;
        let move_distance = $wizard.width() / total_steps;
        let index_temp = index;
        let vertical_level = 0;

        const mobile_device = $(document).width() < 600 && $total > 3;

        if (mobile_device) {
          move_distance = $wizard.width() / 2;
          index_temp = index % 2;
          $li_width = 50;
        }

        $wizard.find(".nav li").css("width", $li_width + "%");

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

        $wizard.find(".moving-tab").css("width", step_width);
        $(".moving-tab").css({
          transform:
            "translate3d(" + move_distance + "px, " + vertical_level + "px, 0)",
          transition: "all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)"
        });
        $(".moving-tab").css("transition", "transform 0s");
      },

      onTabClick: function(tab: any, navigation: any, index: any) {
        return true;
        const $valid = $(".card-wizard form").valid();

        if (!$valid) {
          return false;
        } else {
          return true;
        }
      },

      onTabShow: function(tab: any, navigation: any, index: any) {
        // console.log("on tab show");
        let $total = navigation.find("li").length;
        let $current = index + 1;

        const $wizard = navigation.closest(".card-wizard");

        // If it's the last tab then hide the last button and show the finish instead
        if ($current >= $total) {
          $($wizard)
            .find(".publish")
            .hide();
          $($wizard)
            .find(".btn-next")
            .hide();
          $($wizard)
            .find(".btn-finish")
            .show();
        } else {
          $($wizard)
            .find(".publish")
            .show();
          $($wizard)
            .find(".btn-next")
            .show();
          $($wizard)
            .find(".btn-finish")
            .hide();
        }

        const button_text = navigation
          .find("li:nth-child(" + $current + ") a")
          .html();

        setTimeout(function() {
          $(".moving-tab").text(button_text);
        }, 150);

        const checkbox = $(".footer-checkbox");

        if (index !== 0) {
          $(checkbox).css({
            opacity: "0",
            visibility: "hidden",
            position: "absolute"
          });
        } else {
          $(checkbox).css({
            opacity: "1",
            visibility: "visible"
          });
        }
        $total = $wizard.find(".nav li").length;
        let $li_width = 100 / $total;

        const total_steps = $wizard.find(".nav li").length;
        let move_distance = $wizard.width() / total_steps;
        let index_temp = index;
        let vertical_level = 0;

        const mobile_device = $(document).width() < 600 && $total > 3;

        if (mobile_device) {
          move_distance = $wizard.width() / 2;
          index_temp = index % 2;
          $li_width = 50;
        }

        $wizard.find(".nav li").css("width", $li_width + "%");

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

        $wizard.find(".moving-tab").css("width", step_width);
        $(".moving-tab").css({
          transform:
            "translate3d(" + move_distance + "px, " + vertical_level + "px, 0)",
          transition: "all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)"
        });
      }
    });

    // Prepare the preview for profile picture
    $("#wizard-picture").change(function() {
      const input = $(this);

      if (input[0].files && input[0].files[0]) {
        const reader = new FileReader();

        reader.onload = function(e: any) {
          $("#wizardPicturePreview")
            .attr("src", e.target.result)
            .fadeIn("slow");
        };
        reader.readAsDataURL(input[0].files[0]);
      }
    });

    $('[data-toggle="wizard-radio"]').click(function() {
      const wizard = $(this).closest(".card-wizard");
      wizard.find('[data-toggle="wizard-radio"]').removeClass("active");
      $(this).addClass("active");
      $(wizard)
        .find('[type="radio"]')
        .removeAttr("checked");
      $(this)
        .find('[type="radio"]')
        .attr("checked", "true");
    });

    $('[data-toggle="wizard-checkbox"]').click(function() {
      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        $(this)
          .find('[type="checkbox"]')
          .removeAttr("checked");
      } else {
        $(this).addClass("active");
        $(this)
          .find('[type="checkbox"]')
          .attr("checked", "true");
      }
    });
    $(".set-full-height").css("height", "auto");
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(this.content, "content on ng on changes");
    if (this.localSectors.length <= this.sectors.length) {
      console.log(this.localSectors, ">>>>> local sectors ");
      this.localSectors = this.sectors;
      console.log(
        this.localSectors,
        "local sectors on ng on change",
        this.sectors
      );
    } else {
      console.log(
        this.localSectors,
        "local sectors on ng on change",
        "sectors from parent==",
        this.sectors
      );
    }

    console.log("wizard container ngonchanges");

    const input = $(this);
    if (input[0].files && input[0].files[0]) {
      const reader: any = new FileReader();
      reader.onload = function(e: any) {
        $("#wizardPicturePreview")
          .attr("src", e.target.result)
          .fadeIn("slow");
      };
      reader.readAsDataURL(input[0].files[0]);
    }
  }

  sendInputToParent(input) {
    // console.log(event, "test for event");
    this.smartSearchInput.emit(input);
  }

  publishContent() {
    if (
      !this.content.image_urls.length &&
      !this.content.video_urls.length &&
      !this.content.embed_urls.length
    ) {
      swal({
        title: "Are you sure you want to publish without adding media content",
        // text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn btn-success",
        cancelButtonClass: "btn btn-warning",
        confirmButtonText: "Yes",
        buttonsStyling: false
      }).then(result => {
        if (result.value) {
          this.contentSubmitted.emit(this.content);

          // swal({
          //   title: "Deleted!",
          //   // text: "Your file has been deleted.",
          //   type: "success",
          //   confirmButtonClass: "btn btn-success",
          //   buttonsStyling: false
          // });
        }
      });
    }
    // console.log(Number.MAX_VALUE, "max value");
    // console.log(this.content.location, "content location");
    else {
      this.contentSubmitted.emit(this.content);
    }
  }

  sendDataBack() {
    this.fieldsPopulated.emit(this.content);
  }

  ngAfterViewInit() {
    // console.log("wizard after view in it");

    $(window).resize(() => {
      $(".card-wizard").each(function() {
        const $wizard = $(this);
        const index = $wizard.bootstrapWizard("currentIndex");
        const $total = $wizard.find(".nav li").length;
        let $li_width = 100 / $total;

        const total_steps = $wizard.find(".nav li").length;
        let move_distance = $wizard.width() / total_steps;
        let index_temp = index;
        let vertical_level = 0;

        const mobile_device = $(document).width() < 600 && $total > 3;

        if (mobile_device) {
          move_distance = $wizard.width() / 2;
          index_temp = index % 2;
          $li_width = 50;
        }

        $wizard.find(".nav li").css("width", $li_width + "%");

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

        $wizard.find(".moving-tab").css("width", step_width);
        $(".moving-tab").css({
          transform:
            "translate3d(" + move_distance + "px, " + vertical_level + "px, 0)",
          transition: "all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)"
        });

        $(".moving-tab").css({
          transition: "transform 0s"
        });
      });
    });
  }

  removePhoto(index) {
    this.filesService
      .deleteFile(this.content["image_urls"][index]["key"])
      .promise()
      .then(data => {
        if (this.content.image_urls[index].url === this.content.featured_url) {
          this.content.featured_url = "";
          this.content.featured_type = "";
        }
        this.content.image_urls.splice(index, 1);
      })
      .catch(e => {
        console.log("Err: ", e);
      });
  }

  removeAll() {
    this.content.image_urls.forEach((imageObj, i) => {
      this.filesService
        .deleteFile(imageObj["key"])
        .promise()
        .then(data => {
          // console.log("Deleted file: ", data);
          if (this.content.image_urls.length === i + 1) {
            this.content.image_urls = [];
          }
        })
        .catch(e => {
          console.log("Err: ", e);
        });
    });
  }

  // function trigger the multipart upload for more than 5MB
  onFileSelectedForBiggerFiles(event) {
    const file = event.target.files[0];
    if (typeof FileReader !== "undefined") {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.filesService
          .multiPartUpload(e.target.result, file.name)
          .then(data => {
            console.log(">>>>>data: ", data);
          });
      };
      reader.readAsBinaryString(file);
    }
  }

  onFileSelected(event) {
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      const type = event.target.files[i].type.split("/")[0];
      const size = file.size;

      if (size > 5e6) {
        alert("File size exceeds the 5MB limit");
        return;
      }

      switch (type) {
        case "image": {
          if (typeof FileReader !== "undefined") {
            const reader = new FileReader();

            reader.onload = (e: any) => {
              const img_id = file.name;
              this.filesService
                .uploadFile(e.target.result, img_id)
                .promise()
                .then(values => {
                  this.content.image_urls.push({
                    url: values["Location"],
                    mimeType: event.target.files[i].type,
                    key: values["Key"]
                  });
                  if (!this.content.featured_url) {
                    this.content.featured_url = this.content.image_urls[0].url;
                    this.content.featured_type = "image";
                  }
                })
                .catch(e => console.log("Err:: ", e));
            };
            reader.readAsArrayBuffer(file);
          }
          break;
        }
        case "video": {
          const video = event.target.files[i];
          this.filesService
            .uploadFile(video, video.name)
            .promise()
            .then(data => {
              this.content.video_urls.push({
                key: data["Key"],
                mimeType: event.target.files[i].type,
                url: data["Location"]
              });
              if (!this.content.featured_url) {
                this.content.featured_url = this.content.video_urls[0].url;
                this.content.featured_type = "video";
              }
            })
            .catch(e => console.log("Err:: ", e));
          break;
        }
        case "application":
        case "text": {
          const doc = event.target.files[i];
          this.filesService
            .uploadFile(doc, doc.name)
            .promise()
            .then(data => {
              this.content.attachments.push({
                key: data["Key"],
                mimeType: event.target.files[i].type,
                url: data["Location"]
              });
            })
            .catch(e => console.log("Err:: ", e));
          break;
        }
        default: {
          console.log("unknown file type");
          alert("Unknown file type.");
          break;
        }
      }
    }
  }

  removeVideo(index: number) {
    this.filesService
      .deleteFile(this.content["video_urls"][index]["key"])
      .promise()
      .then(data => {
        if (this.content.video_urls[index].url === this.content.featured_url) {
          this.content.featured_url = "";
          this.content.featured_type = "";
        }
        this.content.video_urls.splice(index, 1);
      })
      .catch(e => {
        console.log("Err: ", e);
      });
  }

  removeEmbed(index: number) {
    this.content.embed_urls.splice(index, 1);
    if (this.content.embed_urls[index] === this.content.featured_url) {
      this.content.featured_url = "";
      this.content.featured_type = "";
    }
  }

  

  isComplete() {
    if (this.contentType === "problem") {
      return (
        this.content.title &&
        this.content.description &&
        this.content.organization &&
        this.localSectors.length &&
        // this.content.min_population &&
        this.content.max_population &&
        this.content.location.length
      );
    } else {
      return (
        this.content.description &&
        this.content.organization &&
        this.content.max_population &&
        this.content.location.length
      );
    }
  }

  setFeatured(type, index) {
    // console.log(type, index);
    if (type === "image") {
      this.content.featured_type = "image";
      this.content.featured_url = this.content.image_urls[index].url;
    } else if (type === "video") {
      this.content.featured_type = "video";
      this.content.featured_url = this.content.video_urls[index].url;
    } else if (type === "embed") {
      this.content.featured_type = "embed";
      this.content.featured_url = this.content.embed_urls[index];
    }
  }

  addMediaUrl() {
    if (this.media_url) {
      this.content.embed_urls.push(this.media_url);
      if (!this.content.featured_url) {
        this.content.featured_url = this.media_url;
        this.content.featured_type = "embed";
      }
    }
  }

  checkMedialUrl(url: string) {
    if (!url.startsWith("http")) {
      return false;
    }

    if (url.match(re)) {
      return true;
    } else {
      return false;
    }
  }
}
