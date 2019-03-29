import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  OnDestroy
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Observable, Subscription, interval } from "rxjs";
import { first, finalize, startWith, take, map } from "rxjs/operators";

import { ProblemService } from "../../services/problem.service";
import { AuthService } from "../../services/auth.service";
import { UsersService } from "../../services/users.service";
import * as Query from "../../services/queries";
import { Apollo, QueryRef } from "apollo-angular";
import gql from "graphql-tag";
import swal from "sweetalert2";
import { NgForm } from "@angular/forms";
import { NguCarouselConfig } from "@ngu/carousel";
import { slider } from "./problem-detail.animation";
import { DiscussionsService } from "src/app/services/discussions.service";
import { FilesService } from "src/app/services/files.service";
import { CollaborationService } from "src/app/services/collaboration.service";
import { ValidationService } from "src/app/services/validation.service";
import { EnrichmentService } from "src/app/services/enrichment.service";

const misc: any = {
  navbar_menu_visible: 0,
  active_collapse: true,
  disabled_collapse_init: 0
};

declare var $: any;
interface attachment_object {
  key: string;
  url: string;
  mimeType: string;
}

@Component({
  selector: "app-problem-detail",
  templateUrl: "./problem-detail.component.html",
  styleUrls: ["./problem-detail.component.css"],
  animations: [slider],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProblemDetailComponent implements OnInit, OnDestroy {
  // chartData: any;

  problemDataQuery: QueryRef<any>;
  problemDataSubcription: Subscription;
  objectValues = Object["values"];
  discussions = [];
  replyingTo = 0;
  showReplyBox = false;
  showCommentBox = false;
  numOfComments = 5;
  enrichmentData: any = {
    description: "",
    location: [],
    organization: "",
    resources_needed: "",
    image_urls: [],
    attachments: [],
    video_urls: [],
    impact: "",
    min_population: 0,
    max_population: 0,
    extent: "",
    beneficiary_attributes: "",
    voted_by: "{}",
    featured_url: "",
    embed_urls: [],
    featured_type: ""
  };
  problemData: any = {
    id: "",
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
    voted_by: "",
    watched_by: "",
    created_by: "",
    is_draft: "",
    attachments: []
  };

  public problemOwner: string;

  enrichDataToEdit: any;
  tags: any = [];
  sectorMatched: boolean = false;
  enrichDataArray: any[];
  validationArray: any[];
  sectors: any[] = [];
  number_of_votes: number = 0;
  isWatching: boolean = false;
  isVoted: boolean = false;
  watchedBy: number = 0;
  userInterests: any = {};
  sectorsOfProblem: any[] = [];
  userPersonas = {
    is_ngo: false,
    is_innovator: false,
    is_expert: false,
    is_government: false,
    is_funder: false,
    is_beneficiary: false,
    is_incubator: false,
    is_entrepreneur: false
  };
  // enrich: number[] = [1, 2, 3, 4, 5];
  modalImgSrc: String;
  modalVideoSrc: String;
  problem_attachments: any[] = [];
  problem_attachments_index: number = 0;
  problem_attachments_src: any;
  modalSrc: any;
  sources: any;
  singleImg: boolean = false;
  // modalBtnTxt: string;
  imgUrlIndex: number = 0;
  videoUrlIndex: number = 0;
  disableEnrichButton: boolean = false;
  disableValidateButton: boolean = false;
  disableCollaborateButton: boolean = false;

  private listTitles: any[];
  location: Location;
  mobile_menu_visible: any = 0;
  private nativeElement: Node;
  private toggleButton: any;
  private sidebarVisible: boolean;
  private _router: Subscription;
  displayEnrichForm: boolean;
  showCollaborators: boolean;
  hideProblemDetail: boolean = true;
  collaboratorProfileInfo: any;
  comments = {};
  replies = {};
  popularDiscussions: any = [];
  collaboratorIntent: any;

  fabTogglerState: boolean = false;

  // openform: any;
  // reply: any;
  // index: any;
  // form = {
  //   comment: null,
  //   user_id: 1,
  //   problem_id: 3
  // };
  // data: any;
  // putReply: any;
  // netReply: any;

  // Carousel
  @Input() name: string;
  userId: Number;
  enrichment: any = [1];
  enrichmentDataToView: any;
  validationDataToView: any;
  validationDataToEdit: any;
  validation: any = [1];
  collaborators: any = [1];
  collaboratorDataToEdit: any;

  public carouselTileItems$: Observable<any>;
  public carouselTileItemsValid$: Observable<number[]>;
  public carouselTileItemCollab$: Observable<number[]>;
  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 2, sm: 2, md: 2, lg: 2, all: 0 },
    slide: 2,
    speed: 250,
    point: {
      visible: true
    },
    touch: true,

    loop: true
  };

  constructor(
    private route: ActivatedRoute,
    private problemService: ProblemService,
    private apollo: Apollo,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    public usersService: UsersService,
    public fileService: FilesService,
    private discussionsService: DiscussionsService,
    private collaborationService: CollaborationService,
    private validationService: ValidationService,
    private enrichmentService: EnrichmentService
  ) { }

  getUserPersonas(id) {
    this.apollo
      .watchQuery<any>({
        query: gql`
          {
            users(where: { id: { _eq: ${id} } }) {
              
              is_ngo
              is_innovator
              is_expert
              is_government
              is_funder
              is_beneficiary
              is_incubator
              is_entrepreneur
              user_tags{
                tag {
                    id
                    name
                }
            }
            }
        }
            
        `
        // pollInterval: 500
      })
      .valueChanges.subscribe(result => {
        console.log("PERSONAS", result);
        if (result.data.users[0]) {
          Object.keys(result.data.users[0]).map(persona => {
            this.userPersonas[persona] = result.data.users[0][persona];
          });
          console.log("persona assignment", result.data.users[0]);
          result.data.users[0].user_tags.map(tag => {
            this.userInterests[tag.tag.name] = tag.tag;
          });
          console.log(this.userInterests, "user interests");
        }
      });
  }

  ngOnInit() {
    console.log("ng on in it on load");

    this.userId = Number(this.auth.currentUserValue.id);

    this.getUserPersonas(Number(this.auth.currentUserValue.id));

    this.carouselTileItems$ = interval(500).pipe(
      startWith(-1),
      take(2),
      map(val => {
        let data;

        if (this.enrichment.length < 1) {
          this.enrichment = [false];
        } else {
          data = this.enrichment;
        }
        console.log(data, "carousel data");
        return data;
      })
    );

    this.carouselTileItemsValid$ = interval(500).pipe(
      startWith(-1),
      take(2),
      map(val => {
        let data;

        if (this.validation.length < 1) {
          this.validation = [false];
        } else {
          data = this.validation;
        }
        return data;
      })
    );

    this.carouselTileItemCollab$ = interval(500).pipe(
      startWith(-1),
      take(2),
      map(val => {
        let data;

        if (this.collaborators && this.collaborators.length < 1) {
          this.collaborators = [false];
        } else {
          data = this.collaborators;
        }
        return data;
      })
    );

    this.minimizeSidebar();
    this.route.params.pipe(first()).subscribe(params => {
      if (params.id) {
        // this.getEnrichmentData(params.id);
        // this.getCollaborators(params.id);
        // // this.getTags(params.id);
        // this.getValidations(params.id);
        this.problemDataQuery = this.apollo.watchQuery<any>({
          query: gql`
          {
            problems(where: { id: { _eq: ${params.id} } }) {
              id
              title
              description
              organization
              location
              resources_needed
              is_draft
              created_by
              modified_at
              image_urls
              voted_by
              featured_url
              featured_type
              watched_by
              video_urls
              impact
              extent
              min_population
              max_population
              beneficiary_attributes
              featured_url
              embed_urls
              featured_type
              attachments
              usersBycreatedBy {
                id
                name
              } 
              problem_tags{
                tag {
                    id
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
            problem_collaborators{
              intent
              is_ngo
              is_innovator
              is_expert
              is_government
              is_funder
              is_beneficiary
              is_incubator
              is_entrepreneur
              user_id
              user {
                id
                name
                photo_url
              } 
              
            }

            enrichmentsByproblemId(order_by:{edited_at: asc}){
              id
              
              description
              extent
              impact
              min_population
              max_population
              organization
              beneficiary_attributes
              location
              resources_needed
              image_urls
              attachments
              video_urls
              created_by
              edited_at
              voted_by
              is_deleted
              featured_url
              embed_urls
              featured_type
              usersBycreatedBy{
                id
                name
                photo_url
              } 
              
            }
            }
        }
            
        `,
          pollInterval: 1000,
          fetchPolicy: "network-only"
        });
        // this.chartQuery.valueChanges.subscribe
        this.problemDataSubcription = this.problemDataQuery.valueChanges.subscribe(
          result => {
            if (
              result.data.problems.length >= 1 &&
              result.data.problems[0].id
            ) {
              Object.keys(this.problemData).map(key => {
                // console.log(key, result.data.problems[0][key]);
                if (result.data.problems[0][key]) {
                  this.problemData[key] = result.data.problems[0][key];
                }
              });

              console.log(this.problemData, "result from nested queries");
              console.log(result.data.problems[0].is_draft, "is draft");
              if (result.data.problems[0]) {
                this.problemOwner =
                  result.data.problems[0].usersBycreatedBy.name;
                result.data.problems[0].problem_tags.map(tags => {
                  if (this.userInterests[tags.tag.name]) {
                    this.sectorMatched = true;
                    console.log(this.sectorMatched, "sector matched");
                  }
                });
                if (result.data.problems[0].problem_tags) {
                  this.tags = result.data.problems[0].problem_tags.map(
                    tagArray => {
                      // console.log(tagArray, "work");
                      return tagArray.tag.name;
                    }
                  );
                }
                Object.keys(this.problemData).map(key => {
                  if (result.data.problems[0][key] && key !== "problem_tags") {
                    this.problemData[key] = result.data.problems[0][key];
                  }
                });

                console.log(this.problemData, "problem data");
                if (result.data.problems[0].voted_by) {
                  this.number_of_votes =
                    result.data.problems[0].voted_by.length;
                }

                if (
                  result.data.problems[0] &&
                  result.data.problems[0].watched_by
                ) {
                  this.watchedBy = result.data.problems[0].watched_by.length;
                }

                if (result.data.problems[0].voted_by) {
                  result.data.problems[0].voted_by.forEach(userId => {
                    if (
                      Number(userId) === Number(this.auth.currentUserValue.id)
                    ) {
                      console.log(userId, "userId");
                      this.isVoted = true;
                    }
                  });
                }
                if (
                  result.data.problems[0] &&
                  result.data.problems[0].watched_by
                ) {
                  console.log(
                    result.data.problems[0].watched_by,
                    "watchedBy",
                    typeof result.data.problems[0].watched_by
                  );
                  result.data.problems[0].watched_by.forEach(userId => {
                    if (
                      Number(userId) === Number(this.auth.currentUserValue.id)
                    ) {
                      this.isWatching = true;
                    }
                  });
                }
                // adding embed urls
                let embedded_urls_arr = this.problemData.embed_urls.map(url => {
                  return { url: url };
                });

                // combining the video_urls and image_urls
                this.problem_attachments = [
                  ...this.problemData["image_urls"],
                  ...this.problemData["video_urls"],
                  ...this.problemData["attachments"],
                  ...embedded_urls_arr
                ];
                console.log(">>>>><<<<<< ", this.problemData);


                this.problem_attachments_src = this.problem_attachments[
                  this.problem_attachments_index
                ];

                this.discussionsService
                  .getComments(params.id)
                  .subscribe(discussions => {
                    if (discussions.data.discussions.length > 0) {
                      console.log(
                        discussions.data.discussions,
                        "\n\n---->discussions<----\n\n\n"
                      );
                      this.discussions = discussions.data.discussions;
                      discussions.data.discussions.map(comment => {
                        // if (!comment.linked_comment_id) {
                        //   this.replies[comment.id] = [];
                        // } else
                        if (comment.linked_comment_id) {
                          // this comment is a reply - add it to the replies object
                          if (!this.replies[comment.linked_comment_id]) {
                            // create reply object so we can add reply
                            this.replies[comment.linked_comment_id] = [comment];
                          } else {
                            // comment reply already exists so push reply into the array
                            this.replies[comment.linked_comment_id].push(
                              comment
                            );
                          }
                        } else {
                          // this comment is a parent comment - add it to the comments object
                          // comment object does not exist
                          console.log("COMMENT ID", comment.id);
                          this.comments[comment.id] = comment;

                          this.replies[comment.id] = [];
                        }
                      });
                      console.log(this.comments);
                    }
                  });
              }
            }

            if (
              result.data.problems.length &&
              result.data.problems[0].enrichmentsByproblemId
            ) {
              result.data.problems[0].enrichmentsByproblemId.map(enrichment => {
                if (
                  enrichment.created_by ===
                  Number(this.auth.currentUserValue.id)
                ) {
                  this.disableEnrichButton = true;
                }
              });
              this.enrichment = result.data.problems[0].enrichmentsByproblemId;
            }

            if (
              result.data.problems.length &&
              result.data.problems[0].problem_validations
            ) {
              result.data.problems[0].problem_validations.map(validation => {
                console.log(validation.validated_by, "test55");
                if (
                  validation.validated_by ===
                  Number(this.auth.currentUserValue.id)
                ) {
                  this.disableValidateButton = true;
                }
              });

              this.validation = result.data.problems[0].problem_validations;
            }

            if (
              result.data.problems.length &&
              result.data.problems[0].problem_collaborators
            ) {
              result.data.problems[0].problem_collaborators.map(
                collaborator => {
                  if (
                    collaborator.user_id ===
                    Number(this.auth.currentUserValue.id)
                  ) {
                    this.disableCollaborateButton = true;
                  }
                }
              );
              this.collaborators =
                result.data.problems[0].problem_collaborators;
            }

            console.log(this.enrichment, "enrichments");
            console.log(this.validation, "validations");

            console.log(this.collaborators, "collaborators");
          },
          error => {
            console.log("error", error);
          }
        );
      }
    });
  }

  sortComments(comments) {
    if (comments.length < 4) {
      return comments.sort(this.compareDateForSort);
    } else {
      return comments
        .sort(this.compareDateForSort)
        .splice(0, this.numOfComments);
    }
  }

  showMoreComments() {
    if (this.numOfComments < this.objectValues(this.comments).length) {
      this.numOfComments += 10;
      this.sortComments(this.objectValues(this.comments));
    }
  }

  compareDateForSort(a, b) {
    var dateA = a.modified_at;
    var dateB = b.modified_at;
    if (dateA < dateB) {
      return 1;
    }
    if (dateA > dateB) {
      return -1;
    }

    return 0;
  }

  replyTo(discussionId) {
    this.showReplyBox = true;
    this.replyingTo = discussionId;
    console.log(discussionId);
  }

  checkUrlIsImg(url) {
    var arr = ["jpeg", "jpg", "gif", "png"];
    var ext = url.substring(url.lastIndexOf(".") + 1);
    if (arr.indexOf(ext) > -1) {
      return true;
    } else {
      return false;
    }
  }

  toggleProblemAttachmentsIndex(dir: boolean) {
    if (
      dir &&
      this.problem_attachments_index < this.problem_attachments.length - 1
    ) {
      this.problem_attachments_index++;
      this.problem_attachments_src = this.problem_attachments[
        this.problem_attachments_index
      ];
    } else if (!dir && this.problem_attachments_index > 0) {
      this.problem_attachments_index--;
      this.problem_attachments_src = this.problem_attachments[
        this.problem_attachments_index
      ];
    }
  }

  showSwal(type) {
    if (type == "input-field") {
      swal({
        title: "Validate Problem",
        html:
          '<div class="form-group">' +
          '<input id="input-field" type="text" placeholder="Enter your text here" class="form-control" />' +
          "</div>",
        showCancelButton: true,
        confirmButtonClass: "btn btn-success",
        cancelButtonClass: "btn btn-danger",
        buttonsStyling: false
      })
        .then(function (result) {
          swal({
            type: "success",
            html:
              "You entered: <strong>" + $("#input-field").val() + "</strong>",
            confirmButtonClass: "btn btn-success",
            buttonsStyling: false
          });
        })
        .catch(swal.noop);
    }
  }

  onToggleFab() {
    this.fabTogglerState = !this.fabTogglerState;
  }

  toggleVideoSrc(actionBtn: String) {
    if (
      actionBtn === "next" &&
      this.videoUrlIndex < this.problemData.video_urls.length - 1
    ) {
      this.videoUrlIndex++;
      this.modalVideoSrc = this.problemData.video_urls[this.videoUrlIndex].url;
    } else if (actionBtn === "prev" && this.videoUrlIndex > 0) {
      this.videoUrlIndex--;
      this.modalVideoSrc = this.problemData.video_urls[this.videoUrlIndex].url;
    }
  }

  minimizeSidebar() {
    const body = document.getElementsByTagName("body")[0];

    if (misc.sidebar_mini_active === true) {
      body.classList.remove("sidebar-mini");
      misc.sidebar_mini_active = false;
    } else {
      setTimeout(function () {
        body.classList.add("sidebar-mini");

        misc.sidebar_mini_active = true;
      }, 300);
    }

    // we simulate the window Resize so the charts will get updated in realtime.
    const simulateWindowResize = setInterval(function () {
      window.dispatchEvent(new Event("resize"));
    }, 180);

    // we stop the simulation of Window Resize after the animations are completed
    setTimeout(function () {
      clearInterval(simulateWindowResize);
    }, 1000);
  }

  //   getValidations(id) {
  //     console.log("validation");
  //     this.apollo
  //       .watchQuery<any>({
  //         query: gql`
  //   {
  //     problems(where: { id: { _eq: ${id} } }) {
  //       id
  //       problem_validations{
  //         comment
  //         agree
  //         created_at
  //         files
  //         validated_by
  //         edited_at
  //         is_deleted

  //         problem_id
  //         user {
  //           id
  //           name
  //         }

  //       }
  //     }
  //   }
  // `
  //         // pollInterval: 200
  //       })
  //       .valueChanges.subscribe(
  //         result => {
  //           console.log(result, "poll interval working");
  //           if (result.data.problems[0].problem_validations) {
  //             result.data.problems[0].problem_validations.map(validation => {
  //               console.log(validation.validated_by, "test55");
  //               if (
  //                 validation.validated_by ===
  //                 Number(this.auth.currentUserValue.id)
  //               ) {
  //                 this.disableValidateButton = true;
  //               }
  //             });

  //             this.validation = result.data.problems[0].problem_validations;
  //           }
  //           console.log(result, "result from validation");
  //         },
  //         error => {
  //           console.log("could not get validations due to ", error);
  //         }
  //       );
  //   }
  test(event) {
    console.log(event, "carousel load");
  }
  //   getCollaborators(id) {
  //     this.apollo
  //       .watchQuery<any>({
  //         query: gql`
  // {
  //   problems(where: { id: { _eq: ${id} } }) {
  //     id
  //     problem_collaborators{
  //       intent
  //       is_ngo
  //       is_innovator
  //       is_expert
  //       is_government
  //       is_funder
  //       is_beneficiary
  //       is_incubator
  //       is_entrepreneur
  //       user_id
  //       user {
  //         id
  //         name
  //         photo_url
  //       }

  //     }
  //   }

  // }
  // `
  //         // pollInterval: 200
  //       })
  //       .valueChanges.subscribe(
  //         result => {
  //           console.log("pool on collab");
  //           console.log(result, "result from collaborators");
  //           if (result.data.problems[0].problem_collaborators) {
  //             result.data.problems[0].problem_collaborators.map(collaborator => {
  //               if (
  //                 collaborator.user_id === Number(this.auth.currentUserValue.id)
  //               ) {
  //                 this.disableCollaborateButton = true;
  //               }
  //             });
  //             this.collaborators = result.data.problems[0].problem_collaborators;

  //             console.log(this.collaborators, "collaborators");
  //           }
  //         },
  //         error => {
  //           console.log("could not get collaborators due to ", error);
  //         }
  //       );
  //   }

  //   getEnrichmentData(problemId) {
  //     console.log(this.problemData.id, "problem id");
  //     this.apollo
  //       .watchQuery<any>({
  //         query: gql`
  //           {
  //             enrichments(where: { problem_id: { _eq: ${problemId} } }) {
  //               id

  //               description
  //               extent
  //               impact
  //               min_population
  //               max_population
  //               organization
  //               beneficiary_attributes
  //               location
  //               resources_needed
  //               image_urls
  //               video_urls
  //               created_by
  //               edited_at
  //               voted_by
  //               is_deleted
  //               featured_url
  //               embed_urls
  //               featured_type

  //             }
  //           }
  //         `
  //         // pollInterval: 200
  //       })
  //       .valueChanges.subscribe(
  //         data => {
  //           if (data.data.enrichments) {
  //             console.log(data, "data");
  //             data.data.enrichments.map(enrichment => {
  //               if (
  //                 enrichment.created_by === Number(this.auth.currentUserValue.id)
  //               ) {
  //                 this.disableEnrichButton = true;
  //               }
  //             });
  //             this.enrichment = data.data.enrichments;

  //             console.log(this.enrichment, "id specifi enrichment");
  //           }
  //         },
  //         err => {
  //           console.log("error", err);
  //         }
  //       );
  //   }

  dimissVideoModal(e) {
    if (e.type === "click") {
      let problemVideoTag: HTMLMediaElement = document.querySelector(
        "#problemVideoID"
      );
      problemVideoTag.pause();
    }
  }

  sidebarClose() {
    var $toggle = document.getElementsByClassName("navbar-toggler")[0];
    const body = document.getElementsByTagName("body")[0];
    this.toggleButton.classList.remove("toggled");
    var $layer = document.createElement("div");
    $layer.setAttribute("class", "close-layer");

    this.sidebarVisible = false;
    body.classList.remove("nav-open");
    // $('html').removeClass('nav-open');
    body.classList.remove("nav-open");
    if ($layer) {
      $layer.remove();
    }

    setTimeout(function () {
      $toggle.classList.remove("toggled");
    }, 400);

    this.mobile_menu_visible = 0;
  }

  watchProblem() {
    if (!(this.userId == this.problemData.created_by)) {
      this.isWatching = !this.isWatching;
      if (this.isWatching) {
        this.watchedBy++;
        this.problemData.watched_by.push(Number(this.auth.currentUserValue.id));

        this.problemData.watched_by = JSON.stringify(
          this.problemData.watched_by
        )
          .replace("[", "{")
          .replace("]", "}");

        console.log(this.problemData.watched_by, "watched_by");

        this.problemService.storeProblemWatchedBy(
          this.problemData.id,
          this.problemData
        );

        this.problemData.watched_by = JSON.parse(
          this.problemData.watched_by.replace("{", "[").replace("}", "]")
        );
      } else {
        this.watchedBy--;

        let index = this.problemData.watched_by.indexOf(
          Number(this.auth.currentUserValue.id).toString()
        );
        console.log(this.problemData.watched_by, "watched_by");

        this.problemData.watched_by.splice(index, 1);

        this.problemData.watched_by = JSON.stringify(
          this.problemData.watched_by
        )
          .replace("[", "{")
          .replace("]", "}");

        this.problemService.storeProblemWatchedBy(
          this.problemData.id,
          this.problemData
        );

        this.problemData.watched_by = JSON.parse(
          this.problemData.watched_by.replace("{", "[").replace("}", "]")
        );
      }
    }
  }

  onEnrichmentSubmit(enrichmentData) {
    if (enrichmentData.__typename) {
      delete enrichmentData.__typename;
      // delete enrichmentData.usersBycreatedBy;
    }
    enrichmentData.created_by = Number(this.auth.currentUserValue.id);

    enrichmentData.problem_id = this.problemData.id;

    if (typeof enrichmentData.voted_by === "string") {
      // this.submitted.emit(this.enrichmentData);
      this.enrichmentService.submitEnrichmentToDB(enrichmentData);
    } else {
      enrichmentData.voted_by = enrichmentData.voted_by = JSON.stringify(
        enrichmentData.voted_by
      )
        .replace("[", "{")
        .replace("]", "}");

      this.enrichmentService.submitEnrichmentToDB(enrichmentData);
    }
  }

  deleteEnrichment(id) {
    this.enrichmentService.deleteEnrichment(id);
  }

  voteEnrichment(enrichmentData) {
    this.enrichmentService.voteEnrichment(enrichmentData);
  }

  onCollaborationSubmit(collaborationData) {
    if (collaborationData.__typename) {
      delete collaborationData.__typename;
    }
    if (collaborationData.user) {
      delete collaborationData.user;
    }

    console.log(collaborationData, "collaboration data");
    collaborationData.user_id = Number(this.auth.currentUserValue.id);

    collaborationData.problem_id = this.problemData.id;

    this.collaborationService.submitCollaboratorToDB(collaborationData);
    console.log(event, "from problem details collab");
    // close modal
    // send to db
  }

  onValidationSubmit(validationData) {
    if (validationData.__typename) {
      delete validationData.__typename;
    }
    validationData.validated_by = Number(this.auth.currentUserValue.id);

    validationData.problem_id = this.problemData.id;

    this.validationService.submitValidationToDB(validationData);
  }

  voteProblem() {
    if (!(this.userId == this.problemData.created_by)) {
      this.isVoted = !this.isVoted;
      if (this.isVoted) {
        this.number_of_votes++;
        this.problemData.voted_by.push(Number(this.auth.currentUserValue.id));
        this.problemData.voted_by = JSON.stringify(this.problemData.voted_by)
          .replace("[", "{")
          .replace("]", "}");

        this.problemService.storeProblemVotedBy(
          this.problemData.id,
          this.problemData
        );
        this.problemData.voted_by = JSON.parse(
          this.problemData.voted_by.replace("{", "[").replace("}", "]")
        );
      } else {
        this.number_of_votes--;
        let index = this.problemData.voted_by.indexOf(
          Number(this.auth.currentUserValue.id)
        );
        this.problemData.voted_by.splice(index, 1);
        this.problemData.voted_by = JSON.stringify(this.problemData.voted_by)
          .replace("[", "{")
          .replace("]", "}");

        this.problemService.storeProblemVotedBy(
          this.problemData.id,
          this.problemData
        );
        this.problemData.voted_by = JSON.parse(
          this.problemData.voted_by.replace("{", "[").replace("}", "]")
        );
      }
    }
  }

  deleteValidation(validationData) {
    this.validationService.deleteValidation(validationData);
  }

  deleteCollaboration(collaborationData) {
    this.collaborationService.deleteCollaboration(collaborationData);
  }

  handleEnrichCardClicked(enrichmentData) {
    this.enrichmentDataToView = enrichmentData;
  }
  handleEnrichEditMode(enrichData) {
    this.enrichmentData = enrichData;
    console.log(enrichData, "event on edit");
  }

  handleValidationCardClicked(validationData) {
    this.validationDataToView = validationData;
  }

  handleValidationEditMode(validationData) {
    this.validationDataToEdit = validationData;
  }

  handleCollaborationEditMode(collaborationData) {
    console.log("edit collab", collaborationData);
    this.collaboratorDataToEdit = collaborationData;
  }

  async onCommentSubmit(event) {
    const [content, mentions, attachments] = event;
    let file_links: attachment_object[];
    let _links = []; //local array

    let all_promise = await attachments.map(file => {
      return this.fileService.uploadFile(file, file.name).promise();
    });

    try {
      _links = await Promise.all(all_promise);
    } catch (error) {
      console.log("Err while uploading reply files");
    }

    if (_links.length) {
      file_links = [];

      _links.forEach((link, i) => {
        file_links.push({
          key: link["key"],
          url: link["Location"],
          mimeType: attachments[i].type
        });
      });
    }

    this.submitComment(content, mentions, file_links);
  }

  submitComment(content, mentions, attachments?) {
    let comment = {
      created_by: this.auth.currentUserValue.id,
      problem_id: this.problemData["id"],
      text: content,
      attachments: attachments, // overwriting the incoming blobs
      mentions: JSON.stringify(mentions)
        .replace("[", "{")
        .replace("]", "}")
    };
    // console.log(content, mentions);
    if (this.showReplyBox) {
      comment["linked_comment_id"] = this.replyingTo;
      this.replyingTo = 0;
      this.showReplyBox = false;
    }
    this.discussionsService.submitCommentToDB(comment);
  }

  async onReplySubmit(comment) {
    let file_links: attachment_object[];
    let _links = []; // local array

    let all_promise = await comment.attachments.map(file => {
      return this.fileService.uploadFile(file, file.name).promise();
    });

    try {
      _links = await Promise.all(all_promise);
    } catch (error) {
      console.log("Err while uploading reply files");
    }

    if (_links.length) {
      file_links = [];
      _links.map((link, i) => {
        file_links.push({
          key: link["key"],
          url: link["Location"],
          mimeType: comment.attachments[i].type
        });
      });
    }

    comment["created_by"] = this.auth.currentUserValue.id;
    comment["problem_id"] = this.problemData["id"];
    comment["attachments"] = file_links; // overwriting the incoming blobs
    this.discussionsService.submitCommentToDB(comment);
  }

  checkIntent(event) {
    this.collaboratorIntent = event;
  }

  dismiss() {
    if (this.collaboratorIntent) {
      swal({
        title: "Are you sure you want to leave?",
        // text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn btn-success",
        cancelButtonClass: "btn btn-danger",
        confirmButtonText: "Yes",
        buttonsStyling: false
      }).then(result => {
        if (result.value) {
          console.log("Received result", result);
          $("#collaboratorModal").modal("hide");
        }
      });
    } else {
      $("#collaboratorModal").modal("hide");
    }
  }

  displayModal(files: { attachmentObj: attachment_object; index: number }) {
    this.sources = files;
    this.modalSrc = files.attachmentObj[files.index];

    /* opening modal */
    $("#enlargeView").modal("show");
  }

  pauseVideo(e) {
    if (e.type === "click") {
      let problemVideoTag: HTMLMediaElement = document.querySelector(
        "#modalVideo"
      );
      if (problemVideoTag) {
        problemVideoTag.pause();
      }
    }
  }

  toggleFileSrc(dir: boolean) {
    if (
      dir &&
      this.sources["index"] < this.sources["attachmentObj"].length - 1
    ) {
      this.sources["index"]++;
      this.modalSrc = this.sources["attachmentObj"][this.sources["index"]];
    } else if (!dir && this.sources["index"] > 0) {
      this.sources["index"]--;
      this.modalSrc = this.sources["attachmentObj"][this.sources["index"]];
    }
  }

  ngOnDestroy() {
    this.problemDataQuery.stopPolling();
    this.problemDataSubcription.unsubscribe();
  }
}
