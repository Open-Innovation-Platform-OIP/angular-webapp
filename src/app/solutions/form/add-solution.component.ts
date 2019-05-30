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
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormGroup
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { TagsService } from "../../services/tags.service";
import { FilesService } from "../../services/files.service";
import { UsersService } from "../../services/users.service";
import { AuthService } from "../../services/auth.service";
import { Router, ActivatedRoute } from "@angular/router";
import { map, startWith } from "rxjs/operators";
import { Observable, Subscription } from "rxjs";
import { GeocoderService } from "../../services/geocoder.service";
import swal from "sweetalert2";
var Buffer = require("buffer/").Buffer;
import { FormBuilder } from "@angular/forms";

import { Content } from "@angular/compiler/src/render3/r3_ast";

import { COMMA, ENTER } from "@angular/cdk/keycodes";
import {
  MatAutocompleteSelectedEvent,
  MatChipInputEvent,
  MatAutocomplete
} from "@angular/material";

import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { first } from "rxjs/operators";
import { SearchService } from "../../services/search.service";

declare var H: any;
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
  selector: "app-add-solution",
  templateUrl: "./add-solution.component.html",
  styleUrls: ["./add-solution.component.css"]
})
export class AddSolutionComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  // @Input() sectors: string[] = [];

  owners: any[] = [];
  // @Input() canProceed: any = true;
  @Output() fieldsPopulated = new EventEmitter();
  @Output() smartSearchInput = new EventEmitter();
  @Output() tagAdded = new EventEmitter();
  @Output() tagRemoved = new EventEmitter();

  @Output() deleteDraft = new EventEmitter();
  @Output() addedOwners = new EventEmitter();
  @Output() addedSectors = new EventEmitter();
  @Output() removedOwners = new EventEmitter();

  file_types = [
    "application/msword",
    " application/vnd.ms-excel",
    " application/vnd.ms-powerpoint",
    "text/plain",
    " application/pdf",
    " image/*",
    "video/*"
  ];

  objectKeys = Object.keys;
  // objectValues = Object.values;

  matcher = new MyErrorStateMatcher();

  type: FormGroup;

  selectedProblems: any = {};

  showProblemImpacts: Boolean = false;
  showProblemResourcesNeeded: Boolean = false;
  showProblemExtent: Boolean = false;
  showProblemBeneficiaryAttributes: Boolean = false;

  populationValue: Number;
  media_url = "";
  autosaveInterval: any;
  locations: any = [];
  locationInputValue: any;
  input_pattern = new RegExp("^s*");

  filteredSectors: Observable<any[]>;
  sectors: any = [];

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  searchResults = {};
  solutionSearchResults: any = [];
  // searchResults = [];
  // smartSearchResults = [];
  problemCtrl = new FormControl();
  ownersCtrl = new FormControl();
  locationCtrl = new FormControl();
  sectorCtrl = new FormControl();
  filteredProblems: Observable<any>;
  searchResultsObservable: Subscription;

  testObject: any = {
    1: {
      id: 1,
      title: "title one",
      impact: "impact one"
    },
    2: {
      id: 2,
      title: "title  two",
      impact: "impact two"
    }
  };
  selectedProblemsData: any = {};
  // filteredProblems = [];
  filteredOwners: Observable<any[]>;
  is_edit: Boolean = false;
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
  hide: boolean = false;

  @ViewChild("problemInput") problemInput: ElementRef<HTMLInputElement>;
  @ViewChild("locationInput") locationInput: ElementRef<HTMLInputElement>;
  @ViewChild("ownerInput") ownerInput: ElementRef<HTMLInputElement>;

  @ViewChild("auto") matAutocomplete: MatAutocomplete;
  @ViewChild("autoSector") matAutocompleteSector: MatAutocomplete;

  objectValues = Object["values"];
  visible = true;
  selectable = true;
  addOnBlur = true;
  options: string[] = ["One", "Two", "Three"];
  filteredOptions: Observable<string[]>;
  problemId: Number;

  // canProceed: Boolean;
  // owners = [];
  voted_by = [];
  watched_by = [];

  solution = {
    title: "",
    description: "",
    technology: "",
    resources: "",
    impact: "",
    timeline: "",
    pilots: "",
    website_url: "",
    deployment: 0,
    budget: {
      title: "",
      cost: 0
    },
    budget_title: "",
    min_budget: 0,
    max_budget: "",
    extent: "",
    beneficiary_attributes: "",
    image_urls: [],
    video_urls: [],
    featured_url: "",
    embed_urls: [],
    featured_type: "",
    created_by: Number(this.auth.currentUserValue.id),
    is_draft: true,
    attachments: []
  };

  @ViewChild("sectorInput") sectorInput: ElementRef<HTMLInputElement>;

  // autoCompleteTags: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private filesService: FilesService,
    private tagService: TagsService,
    private usersService: UsersService,
    private searchService: SearchService,
    private auth: AuthService,
    private here: GeocoderService,
    private apollo: Apollo
  ) {
    this.type = this.formBuilder.group({
      // To add a validator, we must first convert the string value into an array. The first item in the array is the default value if any, then the next item in the array is the validator. Here we are adding a required validator meaning that the firstName attribute must have a value in it.
      title: [null, Validators.required],
      description: [null, Validators.required],
      technology: [null, null],
      resources: [null, null],
      impact: [null, null],
      extent: [null, null],
      beneficiary_attributes: [null, null],
      timeline: [null, null],
      pilots: [null, null],
      deployment: [null, Validators.required],
      website_url: [null, null],
      assessment_metrics: [null, Validators.required],
      media_url: [null, null],
      budget: [null, null],
      budgetTest: [null, null]
    });

    canProceed = true;

    this.filteredSectors = this.sectorCtrl.valueChanges.pipe(
      startWith(null),
      map((sector: string | null) => (sector ? this._filter(sector) : []))
    );

    // this.problem.organization = "Social Alpha";

    this.filteredOwners = this.ownersCtrl.valueChanges.pipe(
      startWith(null),
      map((owner: string | null) => (owner ? this.filterOwners(owner) : []))
    );
  }

  isFieldValid(form: FormGroup, field: string) {
    return !form.get(field).valid && form.get(field).touched;
  }

  showSuccessSwal(title) {
    swal({
      type: "success",
      title: title,
      timer: 3000,
      showConfirmButton: false
    }).catch(swal.noop);
  }

  hideProblems(id) {
    if (id == "problem") {
      this.hide = true;
    } else if (id == "solution") {
      this.hide = false;
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return Object.keys(this.tagService.allTags).filter(
      sector => sector.toLowerCase().indexOf(filterValue) === 0
    );
  }

  sectorSelected(event: MatAutocompleteSelectedEvent): void {
    console.log("event.option.viewValue", event);
    this.sectors.push(event.option.value);
    this.sectorInput.nativeElement.value = "";
    this.sectorCtrl.setValue(null);
    this.addedSectors.emit(this.sectors);
  }

  addSector(event: MatChipInputEvent): void {
    if (!this.matAutocompleteSector.isOpen) {
      const input = event.input;
      const value = event.value;

      if ((value || "").trim()) {
        this.sectors.push(value.trim().toUpperCase());
      }

      if (input) {
        input.value = "";
      }
      this.sectorCtrl.setValue(null);
    }
  }

  removeSector(sector: string): void {
    const index = this.sectors.indexOf(sector);
    if (index >= 0) {
      this.sectors.splice(index, 1);
    }
    if (this.tagService.allTags[sector] && this.solution["id"]) {
      this.tagService.removeTagRelation(
        this.tagService.allTags[sector].id,
        this.solution["id"],
        "solutions"
      );
    }
  }

  displayFieldCss(form: FormGroup, field: string) {
    return {
      "has-error": this.isFieldValid(form, field),
      "has-feedback": this.isFieldValid(form, field)
    };
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    let selectedProblem = event.option.value;
    this.getProblemData(selectedProblem.id);

    this.selectedProblems[selectedProblem.id] = selectedProblem;
    // console.log(this.selectedProblems, "problem set");

    this.problemInput.nativeElement.value = "";
    this.problemCtrl.setValue(null);
    // this.getProblemData(selectedProblem.id);
    delete this.searchResults[selectedProblem.id];
  }
  selectProblem(problem) {
    this.selectedProblems[problem.id] = problem;
    this.getProblemData(problem.id);
    // console.log(this.selectedProblems, "selected problem set");
    delete this.searchResults[problem.id];
  }

  getProblemData(id) {
    // this.searchResultsObservable.unsubscribe();
    this.apollo
      .watchQuery<any>({
        query: gql`
                  {
                      problems(where: { id: { _eq: ${id} } }) {
                      id
                      title
                     
                      impact
                      extent
                      min_population
                      
                      max_population
                      beneficiary_attributes
                      resources_needed
                      problem_tags{
                        tag{
                          name
                        }
                      }
                                  
                      }
                  }
                  `,
        // pollInterval: 500,
        fetchPolicy: "network-only"
      })
      .valueChanges.subscribe(
        result => {
          let problemData = result.data.problems[0];
          // console.log(problemData, "problem data from db");
          if (problemData.problem_tags.length && this.solution.is_draft) {
            problemData.problem_tags.map(tags => {
              this.sectors.push(tags.tag.name);
            });
            this.sectors = this.removeDuplicates(this.sectors);
          }

          this.selectedProblemsData[problemData.id] = problemData;
          // console.log(this.selectedProblemsData, "problem data from db");
        },
        error => {
          console.log(error);
        }
      );
  }

  solutionSearch(solutionSearchInput: string) {
    if (solutionSearchInput.length >= 3) {
      this.searchService.solutionSearch(solutionSearchInput).subscribe(
        value => {
          this.solutionSearchResults = value.data.search_solutions_v2;
          // console.log("Solution title search", this.solutionSearchResults);
        },
        error => {
          console.log(JSON.stringify(error));
        }
      );
    } else {
      this.solutionSearchResults = [];
    }
  }

  focusOnField(event) {
    if (event.target.id === "impact") {
      this.showProblemImpacts = true;
      // this.showProblemResourcesNeeded = ;
    }
    if (event.target.id === "resources_needed") {
      this.showProblemResourcesNeeded = true;
    }
    if (event.target.id === "extent") {
      this.showProblemExtent = true;
    }
    if (event.target.id === "beneficiary_attributes") {
      this.showProblemBeneficiaryAttributes = true;
    }
  }

  blurOnField(event) {
    this.showProblemImpacts = false;
    this.showProblemResourcesNeeded = false;
    this.showProblemExtent = false;
    this.showProblemBeneficiaryAttributes = false;
  }

  remove(problem): void {
    console.log(problem, "remove");
    // const index = this.selectedProblems.indexOf(problem);
    // if (index >= 0) {
    //   this.selectedProblems.splice(index, 1);
    // }
    delete this.selectedProblems[problem.id];
    delete this.selectedProblemsData[problem.id];
    if (this.solution["id"]) {
      this.apollo
        .mutate<any>({
          mutation: gql`
            mutation DeleteMutation($where: problems_solutions_bool_exp!) {
              delete_problems_solutions(where: $where) {
                affected_rows
                returning {
                  problem_id
                }
              }
            }
          `,
          variables: {
            where: {
              problem_id: {
                _eq: problem.id
              },
              solution_id: {
                _eq: this.solution["id"]
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

    // this.tagRemoved.emit(sector);
  }

  saveProblemsInDB(solutionId, problemsArray) {
    let problems = [];
    problemsArray = Object.values(problemsArray);
    problems = problemsArray.map(problem => {
      return {
        problem_id: problem.id,
        solution_id: solutionId
      };
    });
    const upsert_problems_solutions = gql`
      mutation upsert_problems_solutions(
        $problems_solutions: [problems_solutions_insert_input!]!
      ) {
        insert_problems_solutions(
          objects: $problems_solutions
          on_conflict: {
            constraint: problems_solutions_pkey
            update_columns: []
          }
        ) {
          affected_rows
          returning {
            problem_id
            solution_id
          }
        }
      }
    `;
    console.log(problems, "problem added");
    this.apollo
      .mutate({
        mutation: upsert_problems_solutions,
        variables: {
          problems_solutions: problems
        }
      })
      .subscribe(
        data => {
          console.log("problem adddition worked");
        },
        error => {
          console.error(JSON.stringify(error));
        }
      );
  }

  saveOwnersInDB(solutionId, ownersArray) {
    let owners = [];
    owners = ownersArray.map(owner => {
      return {
        user_id: owner.id,
        solution_id: solutionId
      };
    });
    const upsert_solution_owners = gql`
      mutation upsert_solution_owners(
        $solution_owners: [solution_owners_insert_input!]!
      ) {
        insert_solution_owners(
          objects: $solution_owners
          on_conflict: { constraint: solution_owners_pkey, update_columns: [] }
        ) {
          affected_rows
          returning {
            user_id
            solution_id
          }
        }
      }
    `;
    console.log(owners, "owners added");
    this.apollo
      .mutate({
        mutation: upsert_solution_owners,
        variables: {
          solution_owners: owners
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

  searchProblem(event) {
    // console.log("Search Event", event);
    if (event && event.target && event.target.value) {
      // this.searchResultsObservable = this.smartSearch(event.target.value);
      // console.log("Search Event ==", event);

      this.searchResultsObservable = this.smartSearch(
        event.target.value
      ).subscribe(
        result => {
          // console.log(result, "result from search");
          if (result.data.search_problems_v2.length > 0) {
            // this.smartSearchResults = [];
            // this.searchResults = [];
            this.searchResults = {};

            result.data.search_problems_v2.map(problem => {
              this.searchResults[problem["id"]] = problem;
            });
          }
        },
        err => {
          console.error(JSON.stringify(err));
        }
      );
    }
  }

  smartSearch(searchKey) {
    return this.apollo.watchQuery<any>({
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
                    location
                   
                    
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
    }).valueChanges;
  }

  private filterOwners(value: String): any[] {
    if (typeof value === "string") {
      console.log(value, "value in filtered owners");
      const filterValue = value.toLowerCase();
      console.log(filterValue, "value from filter");

      return Object.values(this.usersService.allUsers).filter(owner => {
        if (owner["value"].toLowerCase().indexOf(filterValue) === 0) {
          console.log(owner, "owner", filterValue);
          return owner;
        }
      });
    }
  }

  selectedOwner(event: MatAutocompleteSelectedEvent): void {
    // console.log(event.option, "event value");
    this.owners.push(event.option.value);
    this.ownerInput.nativeElement.value = "";
    this.ownersCtrl.setValue(null);
    this.addedOwners.emit(this.owners);
  }

  removeOwner(owner) {
    console.log(owner, "remove");
    const index = this.owners.indexOf(owner);
    if (index >= 0) {
      this.owners.splice(index, 1);
      this.removedOwners.emit(owner);
    }
    if (this.solution["id"]) {
      this.apollo
        .mutate<any>({
          mutation: gql`
            mutation DeleteMutation($where: solution_owners_bool_exp!) {
              delete_solution_owners(where: $where) {
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
              solution_id: {
                _eq: this.solution["id"]
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
    console.log(this.owners, "removed in container");
  }

  addOwner(event) {
    console.log(event, "event");
  }

  ngOnInit() {
    console.log("solution wizard ng on in it");
    this.tagService.getTagsFromDB();

    this.problemId = Number(this.route.snapshot.paramMap.get("problemId"));
    console.log(this.route.snapshot.paramMap, "problem param");
    if (this.problemId) {
      // this.selectedProblems.add({ id: this.problemId });
      this.selectedProblems[Number(this.problemId)] = this.problemId;
    }
    this.autosaveInterval = setInterval(() => {
      this.autoSave();
    }, 10000);
    console.log(this.selectedProblems, "selected problems set ");

    if (Object.values(this.selectedProblems).length) {
      Object.values(this.selectedProblems).forEach(problem => {
        console.log("selected problems on ngoninit");
        this.getProblemData(problem["id"]);
      });
    }

    this.route.params.pipe(first()).subscribe(params => {
      console.log(params, "params id");

      if (params.id) {
        console.log(params.id, "id");
        this.apollo
          .watchQuery<any>({
            query: gql`
                        {
                            solutions(where: { id: { _eq: ${params.id} } }) {
                            id
                            title
                            created_by
                            technology
                            resources                            
                            description
                            website_url
                            deployment
                            budget
                            is_draft
                            image_urls
                            video_urls
                            attachments
                            impact
                            timeline
                            extent
                            beneficiary_attributes
                            pilots
                            embed_urls
                            featured_url
                            featured_type
                            problems_solutions{
                              problem{
                                id
                                title
                              }
                            }
                            solutions_tags{
                              tag {
                                  id
                                  name
                              }
                          }
                            solution_owners(where: { user_id: { _neq: ${
                              this.auth.currentUserValue.id
                            } } }) {
                              user {
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
          .valueChanges.subscribe(
            result => {
              this.solution["id"] = result.data.solutions[0].id;
              this.is_edit = true;
              Object.keys(this.solution).map(key => {
                // console.log(key, result.data.problems[0][key]);

                this.solution[key] = result.data.solutions[0][key];

                // this.solution.is_draft = result.data.problems[0].is_draft;
              });

              if (result.data.solutions[0].solutions_tags) {
                this.sectors = result.data.solutions[0].solutions_tags.map(
                  tagArray => {
                    return tagArray.tag.name;
                  }
                );
              }

              result.data.solutions[0].problems_solutions.map(problem => {
                // this.selectedProblems.add(problem.problem);
                this.selectedProblems[problem.problem.id] = problem.problem;

                this.getProblemData(problem.problem.id);
              });
              console.log(this.selectedProblems, "SOLUTIONS");
              if (result.data.solutions[0].solution_owners) {
                this.owners = this.removeDuplicates(this.owners);
                result.data.solutions[0].solution_owners.forEach(ownerArray => {
                  this.owners.push(ownerArray.user);
                });
              }
            },
            error => {
              console.error(JSON.stringify(error));
            }
          );
      }
    });

    this.type = this.formBuilder.group({
      // To add a validator, we must first convert the string value into an array. The first item in the array is the default value if any, then the next item in the array is the validator. Here we are adding a required validator meaning that the firstName attribute must have a value in it.
      title: [null, Validators.required],
      description: [null, Validators.required],
      technology: [null, null],
      resources: [null, null],
      impact: [null, null],
      extent: [null, null],
      beneficiary_attributes: [null, null],
      timeline: [null, null],
      pilots: [null, null],
      deployment: [null, Validators.required],
      website_url: [null, null],
      assessment_metrics: [null, Validators.required],
      media_url: [null, null],
      budget: [null, null],
      budgetCost: [null, null]
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
        deployment: {
          required: true
        },
        assessment_metrics: {
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
        window.scroll(0, 0);

        var $valid = $(".card-wizard form").valid();
        if (!$valid) {
          $validator.focusInvalid();
          return false;
        }
      },

      onInit: function(tab: any, navigation: any, index: any) {
        // check number of tabs and fill the entire row
        let $total = navigation.find("li").length;
        let $wizard = navigation.closest(".card-wizard");

        let $first_li = navigation.find("li:first-child a").html();
        let $moving_div = $('<div class="moving-tab">' + $first_li + "</div>");
        $(".card-wizard .wizard-navigation").append($moving_div);

        $total = $wizard.find(".nav li").length;
        let $li_width = 100 / $total;

        let total_steps = $wizard.find(".nav li").length;
        let move_distance = $wizard.width() / total_steps;
        let index_temp = index;
        let vertical_level = 0;

        let mobile_device = $(document).width() < 600 && $total > 3;

        if (mobile_device) {
          move_distance = $wizard.width() / 2;
          index_temp = index % 2;
          $li_width = 50;
        }

        $wizard.find(".nav li").css("width", $li_width + "%");

        let step_width = move_distance;
        move_distance = move_distance * index_temp;

        let $current = index + 1;

        if ($current == 1 || (mobile_device == true && index % 2 == 0)) {
          move_distance -= 8;
        } else if (
          $current == total_steps ||
          (mobile_device == true && index % 2 == 1)
        ) {
          move_distance += 8;
        }

        if (mobile_device) {
          let x: any = index / 2;
          vertical_level = parseInt(x);
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

        let total_steps = $wizard.find(".nav li").length;
        let move_distance = $wizard.width() / total_steps;
        let index_temp = index;
        let vertical_level = 0;

        let mobile_device = $(document).width() < 600 && $total > 3;

        if (mobile_device) {
          move_distance = $wizard.width() / 2;
          index_temp = index % 2;
          $li_width = 50;
        }

        $wizard.find(".nav li").css("width", $li_width + "%");

        let step_width = move_distance;
        move_distance = move_distance * index_temp;

        $current = index + 1;

        if ($current == 1 || (mobile_device == true && index % 2 == 0)) {
          move_distance -= 8;
        } else if (
          $current == total_steps ||
          (mobile_device == true && index % 2 == 1)
        ) {
          move_distance += 8;
        }

        if (mobile_device) {
          let x: any = index / 2;
          vertical_level = parseInt(x);
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
    if (this.solution["id"]) {
      this.apollo
        .mutate<any>({
          mutation: gql`
            mutation DeleteMutation($where: solution_owners_bool_exp!) {
              delete_solution_owners(where: $where) {
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
              solution_id: {
                _eq: this.solution["id"]
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

  publishSolution() {
    if (
      (!this.is_edit && this.solution.is_draft) ||
      (this.is_edit && this.solution.is_draft)
    ) {
      swal({
        title: "Are you sure you want to publish the Solution",
        // text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn btn-success",
        cancelButtonClass: "btn btn-warning",
        confirmButtonText: "Yes",
        buttonsStyling: false
      }).then(result => {
        this.solution.is_draft = false;

        this.submitSolutionToDB();
      });
    } else {
      this.solution.is_draft = false;

      this.submitSolutionToDB();
    }
  }

  deleteSolution(id) {
    return this.apollo.mutate<any>({
      mutation: gql`
        mutation updateMutation(
          $where: solutions_bool_exp!
          $set: solutions_set_input!
        ) {
          update_solutions(where: $where, _set: $set) {
            affected_rows
            returning {
              id
            }
          }
        }
      `,
      variables: {
        where: {
          id: {
            _eq: id
          }
        },
        set: {
          is_deleted: true
        }
      }
    });
  }

  delete() {
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
        this.deleteSolution(this.solution["id"]).subscribe(
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

  linkSolutionToProblem() {
    const upsert_solutions_problems = gql`
      mutation upsert_problems_solutions(
        $problems_solutions: [problems_solutions_insert_input!]!
      ) {
        insert_problems_solutions(
          objects: $problems_solutions
          on_conflict: {
            constraint: problems_solutions_pkey
            update_columns: []
          }
        ) {
          affected_rows
          returning {
            problem_id
          }
        }
      }
    `;
    const solution_problem_object = {
      solution_id: this.solution["id"],
      problem_id: this.problemId
    };
    console.log(solution_problem_object, "solution_problem");

    return this.apollo.mutate({
      mutation: upsert_solutions_problems,
      variables: {
        problems_solutions: [solution_problem_object]
      }
    });
  }

  autoSave() {
    // console.log(this.problem, "problem data");
    // console.log("trying to auto save");
    if (this.solution.is_draft && !this.is_edit) {
      if (this.solution.title) {
        this.submitSolutionToDB();
      }
    }
  }
  removeDuplicates(array) {
    return Array.from(new Set(array));
  }

  submitSolutionToDB() {
    // console.log(problem, "submitted");
    const upsert_solution = gql`
      mutation upsert_solutions($solutions: [solutions_insert_input!]!) {
        insert_solutions(
          objects: $solutions
          on_conflict: {
            constraint: solutions_pkey
            update_columns: [
              title
              description
              technology
              resources
              website_url
              impact
              extent
              beneficiary_attributes
              timeline
              pilots
              deployment
              budget
              is_draft
              image_urls
              video_urls
              featured_url
              featured_type
              embed_urls
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
    console.log("SOLUTION", this.solution);
    this.sectors = this.removeDuplicates(this.sectors);

    this.apollo
      .mutate({
        mutation: upsert_solution,
        variables: {
          solutions: [this.solution]
        }
      })
      .subscribe(
        result => {
          if (result.data.insert_solutions.returning.length > 0) {
            this.solution["id"] = result.data.insert_solutions.returning[0].id;

            this.saveProblemsInDB(this.solution["id"], this.selectedProblems);
            this.saveOwnersInDB(this.solution["id"], this.owners);
            this.saveSectorsInDB();

            console.log(this.solution.is_draft, "draft", this.is_edit);

            if (this.is_edit && !this.solution.is_draft) {
              this.showSuccessSwal("Solution Updated");
              this.router.navigate(["solutions", this.solution["id"]]);
            } else if (!this.is_edit && !this.solution.is_draft) {
              this.showSuccessSwal("Solution Added");
              this.router.navigate(["solutions", this.solution["id"]]);
            } else if (this.is_edit && this.solution.is_draft) {
              this.showSuccessSwal("Solution Added");
              this.router.navigate(["solutions", this.solution["id"]]);
            }
            // this.router.navigate(["solutions", this.solution["id"]]);
          }
        },
        err => {
          console.error(JSON.stringify(err));
        }
      );
  }

  saveSectorsInDB() {
    const tags = [];

    const solution_tags = new Set();
    // console.log(this.sectors, "sectors");

    this.sectors.map(sector => {
      tags.push({ name: sector });

      if (
        this.tagService.allTags[sector] &&
        this.tagService.allTags[sector].id
      ) {
        solution_tags.add({
          tag_id: this.tagService.allTags[sector].id,
          solution_id: this.solution["id"]
        });
      }
    });

    this.tagService.addTagsInDb(tags, "solutions", this.solution["id"]);

    if (solution_tags.size > 0) {
      const upsert_solution_tags = gql`
        mutation upsert_solutions_tags(
          $solutions_tags: [solutions_tags_insert_input!]!
        ) {
          insert_solutions_tags(
            objects: $solutions_tags
            on_conflict: {
              constraint: solutions_tags_pkey
              update_columns: [tag_id, solution_id]
            }
          ) {
            affected_rows
            returning {
              tag_id
              solution_id
            }
          }
        }
      `;
      this.apollo
        .mutate({
          mutation: upsert_solution_tags,
          variables: {
            solutions_tags: Array.from(solution_tags)
          }
        })
        .subscribe(
          data => {},
          err => {
            console.error("Error uploading tags", err);
          }
        );
    }
  }

  sendInputToParent(input) {
    // console.log(event, "test for event");
    this.smartSearchInput.emit(input);
  }

  sendDataBack() {
    this.fieldsPopulated.emit(this.solution);
  }

  ngAfterViewInit() {
    $(window).resize(() => {
      $(".card-wizard").each(function() {
        const $wizard = $(this);
        const index = $wizard.bootstrapWizard("currentIndex");
        let $total = $wizard.find(".nav li").length;
        let $li_width = 100 / $total;

        let total_steps = $wizard.find(".nav li").length;
        let move_distance = $wizard.width() / total_steps;
        let index_temp = index;
        let vertical_level = 0;

        let mobile_device = $(document).width() < 600 && $total > 3;

        if (mobile_device) {
          move_distance = $wizard.width() / 2;
          index_temp = index % 2;
          $li_width = 50;
        }

        $wizard.find(".nav li").css("width", $li_width + "%");

        let step_width = move_distance;
        move_distance = move_distance * index_temp;

        let $current = index + 1;

        if ($current == 1 || (mobile_device == true && index % 2 == 0)) {
          move_distance -= 8;
        } else if (
          $current == total_steps ||
          (mobile_device == true && index % 2 == 1)
        ) {
          move_distance += 8;
        }

        if (mobile_device) {
          let x: any = index / 2;
          vertical_level = parseInt(x);
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
      .deleteFile(this.solution["image_urls"][index]["key"])
      .promise()
      .then(data => {
        if (
          this.solution.image_urls[index].url === this.solution.featured_url
        ) {
          this.solution.featured_url = "";
          this.solution.featured_type = "";
        }
        this.solution.image_urls.splice(index, 1);
      })
      .catch(e => {
        console.log("Err: ", e);
      });
  }

  removeAttachment(index) {
    this.filesService
      .deleteFile(this.solution["attachments"][index]["key"])
      .promise()
      .then(data => {
        this.solution.attachments.splice(index, 1);
      })
      .catch(e => {
        console.log("Err: ", e);
      });
  }

  removeAll() {
    this.solution.image_urls.forEach((imageObj, i) => {
      this.filesService
        .deleteFile(imageObj["key"])
        .promise()
        .then(data => {
          if (this.solution.image_urls.length === i + 1) {
            this.solution.image_urls = [];
          }
        })
        .catch(e => {
          console.log("Err: ", e);
        });
    });
  }

  checkIfExist(data: string) {
    let problem_attachments = [
      ...this.solution["image_urls"],
      ...this.solution["video_urls"],
      ...this.solution["attachments"]
    ];

    let checked = problem_attachments.filter(attachmentObj => {
      return attachmentObj.key === data;
    });

    if (checked.length > 0) {
      return true;
    } else if (this.solution.embed_urls.includes(data)) {
      return true;
    } else {
      return false;
    }
  }

  // function trigger the multipart upload for more than 5MB
  onFileSelectForBiggerFiles(event) {
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      const type = event.target.files[i].type;
      let duplicate = this.checkIfExist(file.name);

      if (typeof FileReader !== "undefined" && !duplicate) {
        const reader = new FileReader();

        reader.onload = (e: any) => {
          let buffer = Buffer.from(e.target.result);
          this.manageUploads(type, file.name, buffer);
        };
        reader.readAsArrayBuffer(file);
      }
    }
  }

  manageUploads(type, name, file) {
    let startWith = type.split("/")[0];
    switch (startWith) {
      case "image":
        this.filesService
          .multiPartUpload(file, name)
          .then(values => {
            if (!values["Location"].startsWith("https")) {
              values["Location"] = `https://${values["Location"]}`;
            }

            this.solution.image_urls.push({
              url: values["Location"],
              mimeType: type,
              key: values["Key"]
            });
            if (!this.solution.featured_url) {
              this.solution.featured_url = this.solution.image_urls[0].url;
              this.solution.featured_type = "image";
            }
          })
          .catch(err => console.log("Image Err: ", err));

        break;

      case "video":
        this.filesService
          .multiPartUpload(file, name)
          .then(values => {
            if (!values["Location"].startsWith("https")) {
              values["Location"] = `https://${values["Location"]}`;
            }

            this.solution.video_urls.push({
              url: values["Location"],
              mimeType: type,
              key: values["Key"]
            });
          })
          .catch(err => console.log("Video Err: ", err));
        break;

      case "application":
      case "text":
        this.filesService
          .multiPartUpload(file, name)
          .then(values => {
            if (!values["Location"].startsWith("https")) {
              values["Location"] = `https://${values["Location"]}`;
            }

            this.solution.attachments.push({
              url: values["Location"],
              mimeType: type,
              key: values["Key"]
            });
          })
          .catch(err => console.log("Docs Err: ", err));
        break;

      default:
        console.log("unknown file type");
        alert("Unknown file type.");
        break;
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
                  this.solution.image_urls.push({
                    url: values["Location"],
                    mimeType: event.target.files[i].type,
                    key: values["Key"]
                  });
                  if (!this.solution.featured_url) {
                    this.solution.featured_url = this.solution.image_urls[0].url;
                    this.solution.featured_type = "image";
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
              this.solution.video_urls.push({
                key: data["Key"],
                mimeType: event.target.files[i].type,
                url: data["Location"]
              });
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
              this.solution.attachments.push({
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
      .deleteFile(this.solution["video_urls"][index]["key"])
      .promise()
      .then(data => {
        if (
          this.solution.video_urls[index].url === this.solution.featured_url
        ) {
          this.solution.featured_url = "";
          this.solution.featured_type = "";
        }
        this.solution.video_urls.splice(index, 1);
      })
      .catch(e => {
        console.log("Err: ", e);
      });
  }

  removeEmbed(index: number) {
    this.solution.embed_urls.splice(index, 1);
    if (this.solution.embed_urls[index] === this.solution.featured_url) {
      this.solution.featured_url = "";
      this.solution.featured_type = "";
    }
  }

  isComplete() {
    return (
      this.solution.title &&
      this.solution.description &&
      this.solution.impact &&
      this.solution.deployment &&
      this.solution.budget.title &&
      this.solution.budget.cost &&
      Object.values(this.selectedProblems).length
    );
  }

  setFeatured(type, index) {
    // console.log(type, index);
    if (type === "image") {
      this.solution.featured_type = "image";
      this.solution.featured_url = this.solution.image_urls[index].url;
    } else if (type === "video") {
      this.solution.featured_type = "video";
      this.solution.featured_url = this.solution.video_urls[index].url;
    } else if (type === "embed") {
      this.solution.featured_type = "embed";
      this.solution.featured_url = this.solution.embed_urls[index];
    }
  }

  addMediaUrl() {
    let duplicate = this.checkIfExist(this.media_url);

    if (this.media_url && !duplicate) {
      this.solution.embed_urls.push(this.media_url);
      this.media_url = "";
      if (!this.solution.featured_url) {
        this.solution.featured_url = this.media_url;
        this.solution.featured_type = "embed";
      }
    }
    if (duplicate) {
      alert("Link already exist.");
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

  ngOnDestroy() {
    clearInterval(this.autosaveInterval);
  }
}
