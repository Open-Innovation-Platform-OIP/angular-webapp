import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  OnDestroy,
  Inject
} from "@angular/core";
import {
  Location,
  LocationStrategy,
  PathLocationStrategy
} from "@angular/common";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { Observable, Subscription, interval } from "rxjs";
import {
  first,
  finalize,
  startWith,
  take,
  map,
  switchMap
} from "rxjs/operators";

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
  providers: [
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy }
  ],
  templateUrl: "./problem-detail.component.html",
  styleUrls: ["./problem-detail.component.css"],
  animations: [slider],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProblemDetailComponent implements OnInit, OnDestroy {
  // chartData: any;
  popup: any;
  watchers = new Set();
  voters = new Set();
  problemDataQuery: QueryRef<any>;
  userDataQuery: QueryRef<any>;

  problemDataSubcription: any;
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
  popular: boolean;
  collaboratorIntent: any;
  pageUrl = "";
  mailToLink = "";

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
  enrichment: any = [];
  enrichmentDataToView: any;
  validationDataToView: any;
  validationDataToEdit: any;
  validation: any = [];
  collaborators: any = [];
  collaboratorDataToEdit: any;
  interval = null;

  public carouselTileItems$: Observable<any>;
  public carouselTileItemsValid$: Observable<number[]>;
  public carouselTileItemCollab$: Observable<number[]>;
  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 2, sm: 2, md: 2, lg: 2, all: 0 },

    speed: 250,
    point: {
      visible: true
    },
    touch: true,

    loop: true
  };

  constructor(
    private router: Router,
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
    private enrichmentService: EnrichmentService,
    ngLocation: Location
  ) {
    this.startInterval();
    const domain = "https://social-alpha-open-innovation.firebaseapp.com";
    this.pageUrl = domain + ngLocation.path();
    const subject = encodeURI("Can you help solve this problem?");
    const body = encodeURI(
      `Hello,\n\nCheck out this link on Social Alpha's Open Innovation platform - ${
        this.pageUrl
      }\n\nRegards,`
    );
    this.mailToLink = `mailto:?subject=${subject}&body=${body}`;
  }

  startInterval() {
    this.interval = setInterval(() => {
      this.cdr.markForCheck();
    }, 1000);
  }

  getUserData(id) {
    this.userDataQuery = this.apollo.watchQuery<any>({
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
            
        `,
      fetchPolicy: "network-only",
      pollInterval: 1000
    });

    this.userDataQuery.valueChanges.subscribe(result => {
      // console.log("PERSONAS", result);
      if (result.data.users[0]) {
        Object.keys(result.data.users[0]).map(persona => {
          this.userPersonas[persona] = result.data.users[0][persona];
        });
        // console.log("persona assignment", result.data.users[0]);
        result.data.users[0].user_tags.map(tag => {
          this.userInterests[tag.tag.name] = tag.tag;
        });
        // console.log(this.userInterests, "user interests");
      }
    });
  }

  loadCarousels() {
    this.carouselTileItems$ = interval(500).pipe(
      startWith(-1),
      take(2),
      map(val => {
        let data;

        if (this.enrichment.length < 1) {
          this.enrichment = [false];
        } else {
          data = this.enrichment;
          return data;
        }
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
          return data;
        }
        // return data;
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
          return data;
        }
      })
    );
  }

  ngOnInit() {
    this.userId = Number(this.auth.currentUserValue.id);

    this.getUserData(Number(this.auth.currentUserValue.id));

    this.loadCarousels();

    this.minimizeSidebar();

    this.problemDataSubcription = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.getProblemData(params.get("id"));
      })
    );
    this.problemDataSubcription.subscribe(
      result => {
        if (result.data.problems.length >= 1 && result.data.problems[0].id) {
          let problem = result.data.problems[0];
          this.parseProblem(problem);
        }
      },
      error => {
        console.log("error", error);
      }
    );
    // this.problem.subscribe(result => {

    //   }
    //   // console.log(this.problemService.problem, "problem");
    // });

    // this.route.params.pipe(first()).subscribe(params => {
    //   if (params.id) {
    //     this.getProblemData(params.id);
    //   }
    // });
  }

  getProblemData(id) {
    this.problemDataQuery = this.apollo.watchQuery<any>({
      query: gql`
      {
        problems(where: { id: { _eq: ${id} } }) {
          id
          title
          description
          organization
          location
          resources_needed
          is_draft
          created_by
          modified_at
          updated_at
          image_urls
         
          featured_url
          featured_type
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

        problem_validations(order_by:{edited_at: desc}){
          validated_by
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
        problem_watchers {
          user_id
        }
        problem_voters {
          user_id
        }
        discussionssByproblemId(order_by: {created_at: desc}) {
          id
          created_by
          created_at
          modified_at
          text
          linked_comment_id
          attachments
          usersBycreatedBy {
            name
            photo_url
          }
        }
        problem_collaborators(order_by:{edited_at: desc}){
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

        enrichmentsByproblemId(order_by:{edited_at: desc}){
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
    return this.problemDataQuery.valueChanges;
    // return problemDataSubcription;
  }

  fbShare() {
    window.open(
      "https://www.facebook.com/sharer/sharer.php?u=" + this.pageUrl,
      "facebook-popup",
      "height=350,width=600"
    );
  }

  twitterShare() {
    window.open(
      "https://twitter.com/share?url=" + this.pageUrl,
      "twitter-popup",
      "height=350,width=600"
    );
  }

  linkedInShare() {
    window.open(
      "https://www.linkedin.com/shareArticle?mini=true&url=" + this.pageUrl,
      "linkedin-popup",
      "height=350,width=600"
    );
  }

  mailShare() {
    // not a great approach as the popup doesn't autoclose. Better to use href on button click.
    const subject = encodeURI("Can you help solve this problem?");
    const body = encodeURI(
      `Hello,\n\nCheck out this link on Social Alpha's Open Innovation platform - ${
        this.pageUrl
      }\n\nRegards,`
    );
    const href = `mailto:?subject=${subject}&body=${body}`;
    this.popup = window.open(href, "email-popup", "height=350,width=600");
  }

  smsShare() {
    const url = "https://sms.socialalpha.jaagalabs.com/send";
    const data = {
      text: `Can you help solve this problem? ${this.pageUrl}`,
      numbers: prompt("Enter phone numbers separated by commas.").split(",")
    };
    // Default options are marked with *
    return fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      // mode: "cors", // no-cors, cors, *same-origin
      // cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "socialalpha"
      },
      // redirect: "follow", // manual, *follow, error
      // referrer: "no-referrer", // no-referrer, *client
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
      .then(response => {
        // console.log(response.json());
        alert("Your message has been sent");
      }) // parses JSON response into native Javascript objects
      .catch(e => {
        console.error("SMS error", e);
      });
  }
  parseProblem(problem) {
    // map core keys
    Object.keys(this.problemData).map(key => {
      // console.log(key, result.data.problems[0][key]);
      if (problem[key]) {
        this.problemData[key] = problem[key];
      }
    });

    problem.enrichmentsByproblemId.map(enrichment => {
      if (enrichment.created_by === Number(this.auth.currentUserValue.id)) {
        this.disableEnrichButton = true;
      }
    });
    this.enrichment = problem.enrichmentsByproblemId;

    problem.problem_validations.map(validation => {
      // console.log(validation.validated_by, "test55");
      if (validation.validated_by === Number(this.auth.currentUserValue.id)) {
        this.disableValidateButton = true;
      }
    });
    this.validation = problem.problem_validations;

    problem.problem_collaborators.map(collaborator => {
      if (collaborator.user_id === Number(this.auth.currentUserValue.id)) {
        this.disableCollaborateButton = true;
      }
    });
    this.collaborators = problem.problem_collaborators;
    console.log(this.collaborators, "collaborators refresh");

    this.loadCarousels();

    // console.log(this.problemData, "result from nested queries");
    // console.log(problem.is_draft, "is draft");
    if (problem.usersBycreatedBy) {
      this.problemOwner = problem.usersBycreatedBy.name;
      problem.problem_tags.map(tags => {
        if (this.userInterests[tags.tag.name]) {
          this.sectorMatched = true;
          // console.log(this.sectorMatched, "sector matched");
        }
      });
      if (problem.problem_tags) {
        this.tags = problem.problem_tags.map(tagArray => {
          // console.log(tagArray, "work");
          return tagArray.tag.name;
        });
      }
      Object.keys(this.problemData).map(key => {
        if (problem[key] && key !== "problem_tags") {
          this.problemData[key] = problem[key];
        }
      });
      problem.problem_watchers.map(watcher => {
        this.watchers.add(watcher.user_id);
      });

      problem.problem_voters.map(voter => {
        this.voters.add(voter.user_id);
      });
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

      this.problem_attachments_src = this.problem_attachments[
        this.problem_attachments_index
      ];

      // console.log(problem.discussionssByproblemId);
      problem.discussionssByproblemId.map(comment => {
        if (comment.linked_comment_id) {
          // console.log(comment);
          // this comment is a reply - add it to the replies object
          if (!this.replies[comment.linked_comment_id]) {
            // create reply object so we can add reply
            this.replies[comment.linked_comment_id] = [comment];
          } else {
            // comment reply already exists so push reply into the array
            this.replies[comment.linked_comment_id].push(comment);
          }
          this.replies[comment.linked_comment_id] = this.removeDuplicateReplies(
            this.replies[comment.linked_comment_id]
          );
        } else {
          // this comment is a parent comment - add it to the comments object
          // comment object does not exist
          // console.log("COMMENT ID", comment.id);
          this.comments[comment.id] = comment;
          if (!this.replies[comment.id]) {
            this.replies[comment.id] = []; // create an empty array for replies to this comment
          }
        }
      });
      this.popularDiscussions = Object.keys(this.replies)
        .sort((a, b) => {
          return this.replies[b].length - this.replies[a].length;
        })
        .map(commentId => {
          return this.comments[commentId];
        });
      console.log("REPLIES", this.replies);
      console.log("COMMENTS", this.comments);
      console.log("POPULAR", this.popularDiscussions);
    }
  }

  removeDuplicateReplies(_replies: any[]) {
    return _replies.filter(
      (item, index, self) => index === self.findIndex(t => t.id === item.id)
    );
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
        .then(function(result) {
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
      setTimeout(function() {
        body.classList.add("sidebar-mini");

        misc.sidebar_mini_active = true;
      }, 300);
    }

    // we simulate the window Resize so the charts will get updated in realtime.
    const simulateWindowResize = setInterval(function() {
      window.dispatchEvent(new Event("resize"));
    }, 180);

    // we stop the simulation of Window Resize after the animations are completed
    setTimeout(function() {
      clearInterval(simulateWindowResize);
    }, 1000);
  }

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

    setTimeout(function() {
      $toggle.classList.remove("toggled");
    }, 400);

    this.mobile_menu_visible = 0;
  }
  toggleWatchProblem() {
    // console.log('toggling watch flag');
    if (!(this.userId == this.problemData.created_by)) {
      if (!this.watchers.has(this.userId)) {
        // user is not currently watching this problem
        // let's add them
        this.watchers.add(this.userId);
        const add_watcher = gql`
        mutation insert_problem_watcher {
          insert_problem_watchers(
            objects: [
              {
                user_id: ${Number(this.userId)},
                problem_id: ${Number(this.problemData.id)},
              }
            ]
          ) {
            returning {
              user_id
              problem_id
            }
          }
        }
      `;
        this.apollo
          .mutate({
            mutation: add_watcher
          })
          .subscribe(
            result => {
              if (result.data) {
                // console.log(result.data);
              }
            },
            err => {
              console.error(JSON.stringify(err));
            }
          );
      } else {
        // user is currently not watching this problem
        // let's remove them
        this.watchers.delete(this.userId);
        const delete_watcher = gql`
        mutation delete_problem_watcher {
          delete_problem_watchers(
            where: {user_id: {_eq: ${Number(
              this.userId
            )}}, problem_id: {_eq: ${Number(this.problemData.id)}}}
          ) {
            affected_rows
          }
        }
      `;
        this.apollo
          .mutate({
            mutation: delete_watcher
          })
          .subscribe(
            result => {
              if (result.data) {
                // console.log(result.data);
              }
            },
            err => {
              console.error(JSON.stringify(err));
            }
          );
      }
    }
  }

  toggleVoteProblem() {
    // console.log('toggling watch flag');
    if (!(this.userId == this.problemData.created_by)) {
      if (!this.voters.has(this.userId)) {
        // user is not currently watching this problem
        // let's add them
        this.voters.add(this.userId);
        const add_voter = gql`
        mutation insert_problem_voter {
          insert_problem_voters(
            objects: [
              {
                user_id: ${Number(this.userId)},
                problem_id: ${Number(this.problemData.id)},
              }
            ]
          ) {
            returning {
              user_id
              problem_id
            }
          }
        }
      `;
        this.apollo
          .mutate({
            mutation: add_voter
          })
          .subscribe(
            result => {
              if (result.data) {
                // console.log(result.data);
              }
            },
            err => {
              console.error(JSON.stringify(err));
            }
          );
      } else {
        // user is currently not watching this problem
        // let's remove them
        this.voters.delete(this.userId);
        const delete_voter = gql`
        mutation delete_problem_voter {
          delete_problem_voters(
            where: {user_id: {_eq: ${Number(
              this.userId
            )}}, problem_id: {_eq: ${Number(this.problemData.id)}}}
          ) {
            affected_rows
          }
        }
      `;
        this.apollo
          .mutate({
            mutation: delete_voter
          })
          .subscribe(
            result => {
              if (result.data) {
                // console.log(result.data);
              }
            },
            err => {
              console.error(JSON.stringify(err));
            }
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
    console.log(collaborationData, "collaboration data");
    collaborationData.user_id = Number(this.auth.currentUserValue.id);

    collaborationData.problem_id = this.problemData.id;

    this.collaborationService.submitCollaboratorToDB(collaborationData);
    console.log(event, "from problem details collab");
    // close modal
    // send to db
  }

  onValidationSubmit(validationData) {
    validationData.validated_by = Number(this.auth.currentUserValue.id);

    validationData.problem_id = this.problemData.id;

    this.validationService.submitValidationToDB(validationData);
  }

  deleteValidation(validationData) {
    this.validationService.deleteValidation(validationData).subscribe(
      ({ data }) => {
        $("#validModal").modal("hide");
        this.disableValidateButton = false;

        return;
      },
      error => {
        console.log("Could delete due to " + error);
      }
    );
  }

  deleteCollaboration(collaborationData) {
    this.collaborationService.deleteCollaboration(collaborationData).subscribe(
      ({ data }) => {
        $("#collaboratorModal").modal("hide");
        this.disableCollaborateButton = false;
      },
      error => {
        console.log("Could delete due to " + error);
      }
    );
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
    // this.openModal("#EditValidationModal");
    $("#EditValidationModal").modal({
      backdrop: "static",
      keyboard: false
    });

    $("#EditValidationModal").modal("show");
  }

  handleCollaborationEditMode(collaborationData) {
    console.log("edit collab", collaborationData);
    this.collaboratorDataToEdit = collaborationData;
  }

  async onCommentSubmit(event, comment_id?) {
    const [content, mentions, attachments] = event;
    console.log(event);
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

    console.log(mentions, "mentions of discussions");
    // let comment = {
    //   created_by: this.auth.currentUserValue.id,
    //   problem_id: this.problemData["id"],
    //   text: content,
    //   attachments: file_links, // overwriting the incoming blobs
    // };
    // // console.log(content, mentions);
    // if (comment_id) {
    //   comment["linked_comment_id"] = comment_id;
    //   // this.replyingTo = 0;
    //   // this.showReplyBox = false;
    // }

    // this.discussionsService.submitCommentToDB(comment, mentions);

    this.submitComment(content, mentions, file_links, comment_id);
  }

  submitComment(content, mentions, attachments?, comment_id?) {
    let comment = {
      created_by: this.auth.currentUserValue.id,
      problem_id: this.problemData["id"],
      text: content,
      attachments: attachments // overwriting the incoming blobs
    };
    if (comment_id) {
      comment["linked_comment_id"] = comment_id;
    }
    // console.log(content, mentions);
    if (this.showReplyBox) {
      comment["linked_comment_id"] = this.replyingTo;
      this.replyingTo = 0;
      this.showReplyBox = false;
    }

    this.discussionsService.submitCommentToDB(comment, mentions);
  }

  // async onReplySubmit(comment) {
  //   let file_links: attachment_object[];
  //   let _links = []; // local array

  //   let all_promise = await comment.attachments.map(file => {
  //     return this.fileService.uploadFile(file, file.name).promise();
  //   });

  //   try {
  //     _links = await Promise.all(all_promise);
  //   } catch (error) {
  //     console.log("Err while uploading reply files");
  //   }

  //   if (_links.length) {
  //     file_links = [];
  //     _links.map((link, i) => {
  //       file_links.push({
  //         key: link["key"],
  //         url: link["Location"],
  //         mimeType: comment.attachments[i].type
  //       });
  //     });
  //   }

  //   comment["created_by"] = this.auth.currentUserValue.id;
  //   comment["problem_id"] = this.problemData["id"];
  //   comment["attachments"] = file_links; // overwriting the incoming blobs
  //   this.discussionsService.submitCommentToDB(comment);
  // }

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

    clearInterval(this.interval);
    /* opening modal */
    $("#enlargeView").modal({
      backdrop: "static",
      keyboard: false
    });

    $("#enlargeView").modal("show");
  }

  closeModal(e) {
    // console.log(e, "e");
    if (e.type === "click") {
      let problemVideoTag: HTMLMediaElement = document.querySelector(
        "#modalVideo"
      );

      this.startInterval();
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

  openModal(id) {
    clearInterval(this.interval);

    /* opening modal */
    $(id).modal({
      backdrop: "static",
      keyboard: false
    });

    $(id).modal("show");
  }

  showPopularDiscussions(id) {
    if (id == "popular") {
      this.popular = true;
    } else if (id == "latest") {
      this.popular = false;
    }
  }

  ngOnDestroy() {
    this.problemDataQuery.stopPolling();
    this.problemDataSubcription.unsubscribe();
    // this.cdr.detach();
    this.userDataQuery.stopPolling();
  }
}
