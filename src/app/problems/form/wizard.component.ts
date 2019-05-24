// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  SimpleChanges
} from "@angular/core";
import {
  FormControl,
  FormBuilder,
  FormGroupDirective,
  NgForm,
  Validators,
  FormGroup
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ErrorStateMatcher } from "@angular/material/core";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import {
  MatAutocompleteSelectedEvent,
  MatChipInputEvent,
  MatAutocomplete
} from "@angular/material";
import { Apollo } from "apollo-angular";
import swal from "sweetalert2";

import gql from "graphql-tag";
import { TagsService } from "../../services/tags.service";
import { FilesService } from "../../services/files.service";
import { UsersService } from "../../services/users.service";
import { AuthService } from "../../services/auth.service";
// import { GeocoderService } from '../../services/geocoder.service';
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { first } from "rxjs/operators";
import { ProblemService } from "../../services/problem.service";
declare var H: any;
declare const $: any;
interface FileReaderEventTarget extends EventTarget {
  result: string;
}

let canProceed: boolean;

interface FileReaderEvent extends Event {
  target: EventTarget;
  getMessage(): string;
}
export interface Sector {
  name: string;
  id: number;
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
  selector: "app-wizard-cmp",
  templateUrl: "wizard.component.html",
  styleUrls: ["wizard.component.css"]
})
export class WizardComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  objectValues = Object["values"];
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  owners: any[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  is_edit = false;
  media_url = "";
  // canProceed: Boolean;
  // owners = [];
  voted_by = [];
  watched_by = [];
  problem = {
    title: "",
    description: "",
    organization: "",
    impact: "",
    extent: "",
    location: [],
    min_population: 0,
    max_population: 0,
    beneficiary_attributes: "",
    resources_needed: "",
    image_urls: [],
    video_urls: [],
    featured_url: "",
    embed_urls: [],
    featured_type: "",

    created_by: Number(this.auth.currentUserValue.id),
    is_draft: true,

    attachments: []
  };
  searchResults = {};
  sectorCtrl = new FormControl();
  filteredSectors: Observable<string[]>;
  sectors: any = [];
  matcher = new MyErrorStateMatcher();
  // autoCompleteTags: any[] = [];
  tags = [];
  autosaveInterval: any;
  type: FormGroup;
  sizes = [
    { value: 100, viewValue: ">100" },
    { value: 1000, viewValue: ">1000" },
    { value: 10000, viewValue: ">10000" },
    { value: 100000, viewValue: ">100,000" }
  ];
  file_types = [
    "application/msword",
    " application/vnd.ms-excel",
    " application/vnd.ms-powerpoint",
    "text/plain",
    " application/pdf",
    " image/*",
    "video/*"
  ];
  @ViewChild("sectorInput") sectorInput: ElementRef<HTMLInputElement>;
  @ViewChild("auto") matAutocomplete: MatAutocomplete;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private filesService: FilesService,
    private apollo: Apollo,
    private tagService: TagsService,
    private usersService: UsersService,
    private auth: AuthService,
    private problemService: ProblemService
  ) {
    canProceed = true;

    this.problem.organization = "Social Alpha";
    this.filteredSectors = this.sectorCtrl.valueChanges.pipe(
      startWith(null),
      map((sector: string | null) =>
        sector
          ? this._filter(sector)
          : Object.keys(this.tagService.allTags).slice()
      )
    );
    // console.log(this.auth.currentUserValue);
  }

  add(event: MatChipInputEvent): void {
    // Add sector only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;
      // Add our sector
      if ((value || "").trim()) {
        this.sectors.push(value.trim());
      }
      // Reset the input value
      if (input) {
        input.value = "";
      }
      this.sectorCtrl.setValue(null);
    }
  }

  addTags(tags) {
    // console.log(tags, "tag working");
    this.sectors = tags;
  }

  remove(sector: string): void {
    const index = this.sectors.indexOf(sector);
    if (index >= 0) {
      this.sectors.splice(index, 1);
    }
    if (this.tagService.allTags[sector] && this.problem["id"]) {
      this.tagService.removeTagRelation(
        this.tagService.allTags[sector].id,
        this.problem["id"],
        "problems"
      );
    }
  }

  addOwners(event) {
    // event = this.removeDuplicates(event);
    this.owners = event;
  }

  removeOwners(owner) {
    const index = this.owners.indexOf(owner);
    if (index >= 0) {
      this.owners.splice(index, 1);
    }
    console.log(this.owners, "removed from wizard");
    if (this.problem["id"]) {
      this.apollo
        .mutate<any>({
          mutation: gql`
            mutation DeleteMutation($where: problem_owners_bool_exp!) {
              delete_problem_owners(where: $where) {
                affected_rows
                returning {
                  user_id
                }
              }
            }
          `,
          variables: {
            where: {
              user_id: {
                _eq: owner.id
              },
              problem_id: {
                _eq: this.problem["id"]
              }
            }
          }
        })
        .subscribe(
          ({ data }) => {
            console.log("worked", data);
            // location.reload();
            // location.reload();
            // this.router.navigateByUrl("/problems");

            return;
          },
          error => {
            console.log("Could not delete due to " + error);
          }
        );
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

  isFieldValid(form: FormGroup, field: string) {
    return !form.get(field).valid && form.get(field).touched;
  }

  displayFieldCss(form: FormGroup, field: string) {
    return {
      "has-error": this.isFieldValid(form, field),
      "has-feedback": this.isFieldValid(form, field)
    };
  }

  ngOnDestroy() {
    clearInterval(this.autosaveInterval);
  }
  ngOnInit() {
    // this.tagService.getTagsFromDB();

    console.log("wizard ng on in it");
    clearInterval(this.autosaveInterval);
    this.autosaveInterval = setInterval(() => {
      this.autoSave();
    }, 10000);
    this.route.params.pipe(first()).subscribe(params => {
      if (params.id) {
        this.apollo
          .watchQuery<any>({
            query: gql`
                        {
                            problems(where: { id: { _eq: ${params.id} } }) {
                            id
                            title
                            created_by
                            updated_at
                            description
                            location
                            resources_needed
                            is_draft
                            image_urls
                            video_urls
                            attachments
                            impact
                            extent
                            min_population
                            embed_urls
                            max_population
                            beneficiary_attributes
                            organization
                            featured_url
                            featured_type
                            problem_owners{
                              user{
                                id
                                name

                              }
                             
                            }
                           
                          
                            problem_tags{
                                tag {
                                    id
                                    name
                                }
                            }
                            }
                        }
                        `,
            // pollInterval: 500,
            fetchPolicy: "network-only"
          })
          .valueChanges.subscribe(result => {
            // console.log(result, "pppp>>>>>>>>");
            if (
              result.data.problems.length >= 1 &&
              result.data.problems[0].id
            ) {
              // console.log(result.data.problems[0], "edit problem");
              canProceed = true;
              this.problem["id"] = result.data.problems[0].id;
              Object.keys(this.problem).map(key => {
                // console.log(key, result.data.problems[0][key]);
                if (result.data.problems[0][key]) {
                  this.problem[key] = result.data.problems[0][key];
                }
                this.problem.is_draft = result.data.problems[0].is_draft;
              });
              if (this.problem.title && this.problem.is_draft) {
                this.smartSearch();
              }
              if (result.data.problems[0].problem_tags) {
                this.sectors = result.data.problems[0].problem_tags.map(
                  tagArray => {
                    return tagArray.tag.name;
                  }
                );
                // console.log(this.sectors, "sectors from db");
              }
              if (result.data.problems[0].problem_owners) {
                // this.owners = result.data.problems[0].problem_owners;
                result.data.problems[0].problem_owners.forEach(ownerArray => {
                  if (
                    ownerArray.user.id != Number(this.auth.currentUserValue.id)
                  ) {
                    this.owners.push(ownerArray.user);
                    // console.log(
                    //   ownerArray.user.id,
                    //   "owner array",
                    //   Number(this.auth.currentUserValue.id)
                    // );

                    // return ownerArray.user;
                  }
                });

                // console.log(this.owners, "owners from db");
              }

              this.is_edit = true;
            } else {
              this.router.navigate(["problems/add"]);
            }
          });
      }
    });
    this.tagService.getTagsFromDB();
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

      // onNext: function(tab, navigation, index) {
      //   const $valid = $(".card-wizard form").valid();
      //   if (!$valid) {
      //     $validator.focusInvalid();
      //     return false;
      //   } else if (!canProceed) {
      //     if (
      //       confirm(
      //         "Are you sure you want to add a new problem and not enrich an existing one?"
      //       )
      //     ) {
      //       canProceed = true;
      //       return true;
      //     } else {
      //       return false;
      //     }
      //   }
      // },

      onInit: function(tab: any, navigation: any, index: any) {
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
        let $total = navigation.find("li").length;
        let $current = index + 1;

        const $wizard = navigation.closest(".card-wizard");

        // If it's the last tab then hide the last button and show the finish instead
        if ($current >= $total) {
          $($wizard)
            .find(".btn-next")
            .hide();
          $($wizard)
            .find(".btn-finish")
            .show();
        } else {
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
  ngAfterViewInit() {
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

  test(event) {
    // console.log(event, "event");
  }

  removePhoto(index) {
    this.filesService
      .deleteFile(this.problem["image_urls"][index]["key"])
      .promise()
      .then(data => {
        if (this.problem.image_urls[index].url === this.problem.featured_url) {
          this.problem.featured_url = "";
          this.problem.featured_type = "";
        }
        this.problem.image_urls.splice(index, 1);
      })
      .catch(e => {
        console.log("Err: ", e);
      });
  }

  removeAll() {
    this.problem.image_urls.forEach((imageObj, i) => {
      this.filesService
        .deleteFile(imageObj["key"])
        .promise()
        .then(data => {
          // console.log("Deleted file: ", data);
          if (this.problem.image_urls.length === i + 1) {
            this.problem.image_urls = [];
          }
        })
        .catch(e => {
          console.log("Err: ", e);
        });
    });
  }

  onFileSelected(event) {
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      const type = event.target.files[i].type.split("/")[0];
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
                  this.problem.image_urls.push({
                    url: values["Location"],
                    key: values["Key"]
                  });
                  if (!this.problem.featured_url) {
                    this.problem.featured_url = this.problem.image_urls[0].url;
                    this.problem.featured_type = "image";
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
              this.problem.video_urls.push({
                key: data["Key"],
                url: data["Location"]
              });
              if (!this.problem.featured_url) {
                this.problem.featured_url = this.problem.video_urls[0].url;
                this.problem.featured_type = "video";
              }
            })
            .catch(e => console.log("Err:: ", e));
          break;
        }
        default: {
          console.log("unknown file type");
          alert("Unknown file type. Please upload images or videos");
          break;
        }
      }
    }
  }

  removeVideo(index: number) {
    this.filesService
      .deleteFile(this.problem["video_urls"][index]["key"])
      .promise()
      .then(data => {
        if (this.problem.video_urls[index].url === this.problem.featured_url) {
          this.problem.featured_url = "";
          this.problem.featured_type = "";
        }
        this.problem.video_urls.splice(index, 1);
      })
      .catch(e => {
        console.log("Err: ", e);
      });
  }

  removeEmbed(index: number) {
    this.problem.embed_urls.splice(index, 1);
    if (this.problem.embed_urls[index] === this.problem.featured_url) {
      this.problem.featured_url = "";
      this.problem.featured_type = "";
    }
  }

  smartSearch() {
    let searchKey = this.problem.title + " " + this.problem.description;
    searchKey = searchKey.replace(/[^a-zA-Z ]/g, "");
    console.log(searchKey, "searchkey");

    if (searchKey.length >= 3) {
      this.searchResults = {};
      this.apollo
        .watchQuery<any>({
          query: gql`query {
                    search_problems_v2(
                    args: {search: "${searchKey.toLowerCase()}"},where: { is_draft: { _eq: false } }
                    ){
                    id
                    title
                    description
                    modified_at
                    updated_at
                    image_urls
                    featured_url
                   
                    
                    problem_voters{
                      problem_id
                      user_id
                    }
                    problem_watchers{
                      problem_id
                      user_id
      
                    }
                    problem_tags {
                        tag {
                            name
                        }
                    }
                   
                    problem_validations{
                      comment
                      agree
                      created_at
                      files
                      validated_by
                      edited_at
                      is_deleted
              
                      problem_id
                      user {
                        id
                        name
                      } 
                      
                    }
                    }
                    }`,
          fetchPolicy: "no-cache"
          // pollInterval: 200
        })
        .valueChanges.subscribe(
          result => {
            console.log(result, "result from search");
            if (result.data.search_problems_v2.length > 0) {
              // console.log(result.data.search_problems_v2.length, "search");
              result.data.search_problems_v2.map(result => {
                if (result.id != this.problem["id"]) {
                  this.searchResults[result.id] = result;
                }
              });
              // console.log(this.searchResults, ">>>>>searchresults");
              if (!this.is_edit) {
                canProceed = false;
              }
            }
          },
          err => {
            // console.log(err, "error from smart search");
            console.error(JSON.stringify(err));
          }
        );
    } else {
      this.searchResults = {};
    }
  }

  isComplete() {
    return (
      this.problem.title &&
      this.problem.description &&
      this.problem.organization &&
      // this.problem.min_population &&
      this.problem.location
    );
  }
  updateProblem(updatedProblem) {
    // console.log(updatedProblem, "updated problem");
    this.problem = updatedProblem;
  }
  removeDuplicates(array) {
    return Array.from(new Set(array));
  }

  autoSave() {
    // console.log(this.problem, "problem data");
    // console.log("trying to auto save");
    if (this.problem.is_draft) {
      if (this.problem.title) {
        this.submitProblemToDB(this.problem);
      }
    }
  }

  // saveProblemDraft() {
  //   this.autoSave();
  //   alert("Problem draft has been saved. You can continue editing anytime");
  // }
  showSuccessSwal(title) {
    swal({
      type: "success",
      title: title,
      timer: 3000,
      showConfirmButton: false
    }).catch(swal.noop);
  }

  publishProblem(problem) {
    problem.is_draft = false;
    // console.log(problem, "problem before publishing");
    clearInterval(this.autosaveInterval);
    this.submitProblemToDB(problem);
  }

  deleteDraft(id) {
    swal({
      title: "Are you sure you want to delete this draft?",
      // text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      confirmButtonText: "Yes, delete it!",
      buttonsStyling: false
    }).then(result => {
      if (result.value) {
        this.problemService.deleteProblem(id).subscribe(
          ({ data }) => {
            swal({
              title: "Deleted!",
              // text: "Your file has been deleted.",
              type: "success",
              confirmButtonClass: "btn btn-success",
              buttonsStyling: false
            });
            this.router.navigateByUrl("/dashboard");
          },
          error => {
            console.log("Could delete due to " + error);
            console.error(JSON.stringify(error));
          }
        );
      }
    });
  }

  submitProblemToDB(problem) {
    // console.log(problem, "submitted");
    const upsert_problem = gql`
      mutation upsert_problem($problems: [problems_insert_input!]!) {
        insert_problems(
          objects: $problems
          on_conflict: {
            constraint: problems_pkey
            update_columns: [
              title
              description
              location
              resources_needed
              organization
              impact
              extent
              beneficiary_attributes
              image_urls
              video_urls
              min_population
              max_population
              modified_at
              featured_url
              featured_type
              embed_urls
              is_draft
              attachments
            ]
          }
        ) {
          affected_rows
          returning {
            id
          }
        }
      }
    `;

    console.log(this.sectors, "sectors before removing duplicates");

    this.sectors = this.removeDuplicates(this.sectors);
    console.log(this.sectors, "sectors after removing duplicates");

    this.apollo
      .mutate({
        mutation: upsert_problem,
        variables: {
          problems: [problem]
        }
      })
      .subscribe(
        result => {
          if (result.data.insert_problems.returning.length > 0) {
            this.problem["id"] = result.data.insert_problems.returning[0].id;
            const upsert_tags = gql`
              mutation upsert_tags($tags: [tags_insert_input!]!) {
                insert_tags(
                  objects: $tags
                  on_conflict: { constraint: tags_pkey, update_columns: [name] }
                ) {
                  affected_rows
                  returning {
                    id
                    name
                  }
                }
              }
            `;

            this.saveOwnersInDB(this.problem["id"], this.owners);

            const tags = [];

            const problem_tags = new Set();
            // console.log(this.sectors, "sectors");

            this.sectors.map(sector => {
              tags.push({ name: sector });

              if (
                this.tagService.allTags[sector] &&
                this.tagService.allTags[sector].id
              ) {
                problem_tags.add({
                  tag_id: this.tagService.allTags[sector].id,
                  problem_id: this.problem["id"]
                });
              }
            });

            this.tagService.addTagsInDb(tags, "problems", this.problem["id"]);

            if (problem_tags.size > 0) {
              const upsert_problem_tags = gql`
                mutation upsert_problem_tags(
                  $problems_tags: [problems_tags_insert_input!]!
                ) {
                  insert_problems_tags(
                    objects: $problems_tags
                    on_conflict: {
                      constraint: problems_tags_pkey
                      update_columns: [tag_id, problem_id]
                    }
                  ) {
                    affected_rows
                    returning {
                      tag_id
                      problem_id
                    }
                  }
                }
              `;
              this.apollo
                .mutate({
                  mutation: upsert_problem_tags,
                  variables: {
                    problems_tags: Array.from(problem_tags)
                  }
                })
                .subscribe(
                  data => {
                    if (!this.problem.is_draft) {
                      this.confirmSubmission();
                    }
                  },
                  err => {
                    console.error("Error uploading tags", err);
                    if (!this.problem.is_draft) {
                      this.confirmSubmission();
                    }
                  }
                );
            } else {
              if (!this.problem.is_draft) {
                this.confirmSubmission();
              }
            }
          }
        },
        err => {
          console.error(JSON.stringify(err));
          swal({
            title: "Error",
            text: "Try Again",
            type: "error",
            confirmButtonClass: "btn btn-info",
            buttonsStyling: false
          }).catch(swal.noop);
        }
      );
  }

  saveOwnersInDB(problemId, ownersArray) {
    let owners = [];
    owners = ownersArray.map(owner => {
      return {
        user_id: owner.id,
        problem_id: problemId
      };
    });
    const upsert_problem_owners = gql`
      mutation upsert_problem_owners(
        $problem_owners: [problem_owners_insert_input!]!
      ) {
        insert_problem_owners(
          objects: $problem_owners
          on_conflict: { constraint: problem_owners_pkey, update_columns: [] }
        ) {
          affected_rows
          returning {
            user_id
            problem_id
          }
        }
      }
    `;
    console.log(owners, "owners added");
    this.apollo
      .mutate({
        mutation: upsert_problem_owners,
        variables: {
          problem_owners: owners
        }
      })
      .subscribe(
        data => {
          console.log("owner adddition worked");
        },
        error => {
          console.error(JSON.stringify(error));
        }
      );
  }
  confirmSubmission() {
    if (this.is_edit) {
      this.showSuccessSwal("Problem Updated");
    } else {
      this.showSuccessSwal("Problem Added");
    }

    this.router.navigate(["problems", this.problem["id"]]);
  }

  deleteProblem() {
    if (confirm("Are you sure you want to delete this problem?")) {
      const delete_problem = gql`
                mutation delete_problem {
                    update_problems(
                    where: {sku: {_eq: ${this.problem["id"]}}},
                    _set: {
                        is_deleted: true
                    }
                    ) {
                    affected_rows
                    returning {
                        id
                        is_deleted
                    }
                    }
                }
                `;
      this.apollo
        .mutate({
          mutation: delete_problem
        })
        .subscribe(
          data => {
            this.router.navigate(["problems"]);
          },
          err => {
            console.error(JSON.stringify(err));
          }
        );
    }
  }
  setFeatured(type, index) {
    if (type === "image") {
      this.problem.featured_type = "image";
      this.problem.featured_url = this.problem.image_urls[index].url;
    }
    /* else if (type === "video") {
      this.problem.featured_type = "video";
      this.problem.featured_url = this.problem.video_urls[index].url;
    } else if (type === "embed") {
      this.problem.featured_type = "embed";
      this.problem.featured_url = this.problem.embed_urls[index];
    } */
  }

  addMediaUrl() {
    if (this.media_url) {
      this.problem.embed_urls.push(this.media_url);
      if (!this.problem.featured_url) {
        this.problem.featured_url = this.media_url;
        this.problem.featured_type = "embed";
      }
    }
  }
}
