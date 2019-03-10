import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Observable, Subscription, interval } from "rxjs";
import { first, finalize, startWith, take, map } from "rxjs/operators";
import { ProblemHandleService } from "../../services/problem-handle.service";
import { AuthService } from "../../services/auth.service";
import { UsersService } from '../../services/users.service';
import * as Query from "../../services/queries";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import swal from "sweetalert2";
import { NgForm } from "@angular/forms";
import { NguCarouselConfig } from "@ngu/carousel";
import { slider } from "./problem-detail.animation";
import { DiscussionsService } from "src/app/services/discussions.service";

const misc: any = {
  navbar_menu_visible: 0,
  active_collapse: true,
  disabled_collapse_init: 0
};

declare var $: any;

@Component({
  selector: "app-problem-detail",
  templateUrl: "./problem-detail.component.html",
  styleUrls: ["./problem-detail.component.css"],
  animations: [slider],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProblemDetailComponent implements OnInit {
  userId: any;
  objectValues = Object['values'];
  allUsers = [
    {
      id: 1,
      value: 'Tej'
    },
    {
      id: 2,
      value: 'Shaona'
    }
  ];
  problemData: any = {};
  enrichDataToEdit: any;
  tags: any = [];
  enrichDataArray: any[];
  validationArray: any[];
  sectors: any[] = [];
  number_of_votes: number = 0;
  isWatching: boolean = false;
  isVoted: boolean = false;
  watchedBy: number = 0;
  // enrich: number[] = [1, 2, 3, 4, 5];
  modalImgSrc: String;
  modalVideoSrc: String;
  singleImg: boolean = false;
  modalBtnTxt: string;
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

  fabTogglerState: boolean = false;

  openform: any;
  reply: any;
  index: any;
  form = {
    comment: null,
    user_id: 1,
    problem_id: 3
  };
  data: any;
  putReply: any;
  netReply: any;

  // Carousel
  @Input() name: string;

  enrichment: any = [1];
  enrichmentDataToView: any;
  validationDataToView: any;
  validationDataToEdit: any;
  validation: any = [1];
  collaborators: any = [1];
  collaborationDataToEdit: any;
  public carouselTileItems$: Observable<any>;
  public carouselTileItemsValid$: Observable<number[]>;
  public carouselTileItemCollab$: Observable<number[]>;
  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 1, lg: 3, all: 0 },
    speed: 250,
    point: {
      visible: true
    },
    touch: true,
    loop: true
    // interval: { timing: 1500 },
    // animation: "lazy"
  };

  constructor(
    private route: ActivatedRoute,
    private problemHandleService: ProblemHandleService,
    private apollo: Apollo,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    public usersService: UsersService,
    private discussionsService: DiscussionsService
  ) {}

  ngOnInit() {
    console.log(this.collaborators, "collaborators on load");
    this.userId = Number(this.auth.currentUserValue.id);

    this.carouselTileItems$ = interval(500).pipe(
      startWith(-1),
      take(32),
      map(val => {
        let data;
        // console.log(this.enrich, "asd");
        if (this.enrichment.length < 1) {
          this.enrichment = [false];
        } else {
          data = this.enrichment;
        }
        return data;
      })
    );

    this.carouselTileItemsValid$ = interval(500).pipe(
      startWith(-1),
      take(32),
      map(val => {
        let data;
        // console.log(this.enrich, "asd");
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
      take(32),
      map(val => {
        let data;
        // console.log(this.enrich, "asd");
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
      // this.getEnrichmentData(params.id);
      // this.getCollaborators(params.id);
      // this.getTags(params.id);
      // this.getValidations(params.id);

      if (params.id) {
        this.apollo
          .watchQuery<any>({
            query: gql`
          {
            problems(where: { id: { _eq: ${params.id} } }) {
              id
              title
              description
              organization
              location
              resources_needed
              created_by
              image_urls
              voted_by
              watched_by
              video_urls
              impact
              extent
              min_population
              beneficiary_attributes
            }
          }
        `
          })
          .valueChanges.subscribe(
            result => {
              if (result.data.problems[0]) {
                this.problemData = result.data.problems[0];
                console.log(this.problemData, "problem data");
                if (result.data.problems[0].voted_by) {
                  this.number_of_votes =
                    result.data.problems[0].voted_by.length;
                }
                // console.log(this.number_of_votes, "number of votes");
                if (
                  result.data.problems[0] &&
                  result.data.problems[0].watched_by
                ) {
                  this.watchedBy = result.data.problems[0].watched_by.length;
                }

                if (result.data.problems[0].voted_by) {
                  result.data.problems[0].voted_by.forEach(userId => {
                    if (userId === this.userId) {
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
                    if (userId === this.userId) {
                      this.isWatching = true;
                    }
                  });
                }

                // setting first image to image modal src
                if (
                  this.problemData.image_urls &&
                  this.problemData.image_urls[0] &&
                  this.problemData.image_urls[0].url
                ) {
                  this.modalImgSrc = this.problemData.image_urls[0].url;
                }

                // setting first image to image modal src
                if (
                  this.problemData.video_urls &&
                  this.problemData.video_urls[0] &&
                  this.problemData.video_urls[0].url
                ) {
                  this.modalVideoSrc = this.problemData.video_urls[0].url;
                }

                // If image single image in the list
                if (
                  this.problemData.image_urls &&
                  this.problemData.image_urls.length === 1
                ) {
                  this.singleImg = true;
                  this.modalBtnTxt = "Enlarge image";
                } else {
                  this.singleImg = false;
                  this.modalBtnTxt = "View images";
                }

                // this.getCollaborators(params.id);
                console.log(this.collaborators, "collaborators check");
                this.getEnrichmentData(params.id);
                this.getCollaborators(params.id);
                this.getTags(params.id);
                this.getValidations(params.id);
              }
            },
            error => {
              console.log("error", error);
            }
          );
      }
    });

    // this.discuss();
    // this.replies();
  }

  // toggle image src in modal
  toggleImgSrc(flag: boolean) {
    if (flag && this.imgUrlIndex < this.problemData.image_urls.length - 1) {
      this.imgUrlIndex++;
      this.modalImgSrc = this.problemData.image_urls[this.imgUrlIndex].url;
    }
    if (!flag && this.imgUrlIndex > 0) {
      this.imgUrlIndex--;
      this.modalImgSrc = this.problemData.image_urls[this.imgUrlIndex].url;
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

  // showItems() {
  //   this.fabTogglerState = true;
  // }

  // hideItems() {
  //   this.fabTogglerState = false;
  // }

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

  getTags(id) {
    this.apollo
      .watchQuery<any>({
        query: gql`
  {
    problems(where: { id: { _eq: ${id} } }) {
      id
      problem_tags{
        tag {
          id
          name
        }
      }
    }
  }
`
      })
      .valueChanges.subscribe(
        result => {
          if (result.data.problems[0].problem_tags) {
            this.tags = result.data.problems[0].problem_tags.map(tagArray => {
              // console.log(tagArray, "work");
              return tagArray.tag.name;
            });
          }
        },
        error => {
          console.log("error", error);
        }
      );
  }

  getValidations(id) {
    console.log("validation");
    this.apollo
      .watchQuery<any>({
        query: gql`
  {
    problems(where: { id: { _eq: ${id} } }) {
      id
      problem_validations{
        comment
        agree
        created_at
        files
        validated_by
        edited_at
        is_deleted
        problem_id
        
      }
    }
  }
`
      })
      .valueChanges.subscribe(
        result => {
          if (result.data.problems[0].problem_validations) {
            result.data.problems[0].problem_validations.map(validation => {
              console.log(validation.validated_by, "test55");
              if (validation.validated_by === this.userId) {
                this.disableValidateButton = true;
              }
            });
            this.validation = result.data.problems[0].problem_validations;
          }
          console.log(result, "result from validation");
        },
        error => {
          console.log("could not get validations due to ", error);
        }
      );
  }

  getCollaborators(id) {
    this.apollo
      .watchQuery<any>({
        query: gql`
{
  problems(where: { id: { _eq: ${id} } }) {
    id
    problem_collaborators{
      intent
      collaborate_as
      problem_id
      user_id
      
      
    }
  }

}
`
      })
      .valueChanges.subscribe(
        result => {
          console.log(result, "result from collaborators");
          if (result.data.problems[0].problem_collaborators) {
            result.data.problems[0].problem_collaborators.map(collaborator => {
              if (collaborator.user_id === this.userId) {
                this.disableCollaborateButton = true;
              }
            });
            this.collaborators = result.data.problems[0].problem_collaborators;
            // this.collaboratorProfileInfo = result.data.users[0];
            // console.log(this.collaboratorProfileInfo, "profile info");

            console.log(this.collaborators, "collaborators");
          }
        },
        error => {
          console.log("could not get collaborators due to ", error);
        }
      );
  }

  getEnrichmentData(problemId) {
    console.log(this.problemData.id, "problem id");
    this.apollo
      .watchQuery<any>({
        query: gql`
          {
            enrichments(where: { problem_id: { _eq: ${problemId} } }) {
              id
              
              description
              extent
              impact
              min_population
              
              beneficiary_attributes

              location
              resources_needed
              image_urls
              video_urls
              created_by
              edited_at
              voted_by
              is_deleted
            }
          }
        `
      })
      .valueChanges.subscribe(
        data => {
          if (data.data.enrichments) {
            console.log(data, "data");
            data.data.enrichments.map(enrichment => {
              if (enrichment.created_by === this.userId) {
                this.disableEnrichButton = true;
              }
            });
            this.enrichment = data.data.enrichments;
            console.log(this.enrichment, "id specifi enrichment");
          }
        },
        err => {
          console.log("error", err);
        }
      );
    // console.log(data, "data from enrichment");
    // });
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

  displayEnrich() {
    if (!this.problemHandleService.displayEnrichForm) {
      this.problemHandleService.displayEnrichForm = true;
      this.problemHandleService.displayValidateProblem = false;
    } else {
      this.problemHandleService.displayEnrichForm = false;
    }
  }

  showCollaboratorsView() {
    if (!this.showCollaborators && this.hideProblemDetail) {
      this.showCollaborators = true;
      this.hideProblemDetail = false;
      this.problemHandleService.displayValidateCard = false;
      this.problemHandleService.displayEnrichCard = false;
    } else {
      this.showCollaborators = false;
      this.problemHandleService.displayValidateCard = true;
      this.problemHandleService.displayEnrichCard = true;
      this.hideProblemDetail = true;
    }
  }

  displayValidateComponent() {
    if (!this.problemHandleService.displayValidateProblem) {
      this.problemHandleService.displayValidateProblem = true;
      this.problemHandleService.displayEnrichForm = false;
    } else {
      this.problemHandleService.displayValidateProblem = false;
    }
  }

  enrichmentAdded(isAdded: any) {
    if (isAdded) {
      this.problemHandleService.displayEnrichForm = false;
    }
  }

  watchProblem() {
    this.isWatching = !this.isWatching;
    if (this.isWatching) {
      this.watchedBy++;
      this.problemData.watched_by.push(this.userId);
      // console.log(this.problemData.watched_by.length, "length");
      // this.problemData.watched_by = JSON.stringify(this.problemData.watched_by)
      //   .replace("[", "{")
      //   .replace("]", "}");
      console.log(this.problemData.watched_by, "watched_by");

      this.problemHandleService.storeProblemWatchedBy(
        this.problemData.id,
        this.problemData
      );
    } else {
      this.watchedBy--;
      // delete this.problemData.watched_by[localStorage.getItem("userId")];
      let index = this.problemData.watched_by.indexOf(this.userId.toString());
      console.log(this.problemData.watched_by, "watched_by");
      // this.problemData.watched_by = JSON.parse(
      //   this.problemData.watched_by.replace("{", "[").replace("}", "]")
      // );
      this.problemData.watched_by.splice(index, 1);
      // this.problemData.watched_by = JSON.stringify(this.problemData.watched_by)
      //   .replace("[", "{")
      //   .replace("]", "}");
      this.problemHandleService.storeProblemWatchedBy(
        this.problemData.id,
        this.problemData
      );
      //change the hard coded user id to dynamic one
    }
  }

  voteProblem() {
    this.isVoted = !this.isVoted;
    if (this.isVoted) {
      this.number_of_votes++;
      this.problemData.voted_by.push(this.userId);

      this.problemHandleService.storeProblemVotedBy(
        this.problemData.id,
        this.problemData
      );
    } else {
      this.number_of_votes--;
      let index = this.problemData.voted_by.indexOf(this.userId);
      this.problemData.voted_by.splice(index, 1);

      this.problemHandleService.storeProblemVotedBy(
        this.problemData.id,
        this.problemData
      );
    }
  }

  clickCollab() {
    // console.log(document.getElementById("collabBtn").getAttribute("color"));
    swal({
      title: "Do you want to collaborate",
      showCancelButton: true,
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      buttonsStyling: false
    })
      .then(result => {
        // console.log(result);

        let title;
        if (result.value) {
          this.problemHandleService.collaborate["value"] = result.value;
          this.problemHandleService.collaborate["key"] = "Uncollaborate";
          document.getElementById("collabBtn").style.color = "green";
          // console.log(
          //   document.getElementById("collabBtn").getAttribute("color")
          // );
          title = "Thank you for collaboration";
        } else {
          this.problemHandleService.collaborate["value"] = result.value;
          this.problemHandleService.collaborate["key"] = "Collaborate";
          title = "Thank you";
        }
        // console.log(this.problemHandleService.collaborate);

        swal({
          type: "success",
          title: title,
          confirmButtonClass: "btn btn-success",
          buttonsStyling: false
        });
      })
      .catch(swal.noop);
  }

  // Open Comment Input Field
  OpenComment() {
    this.openform = true;
    return this.openform;
  }

  // Close Comment Input Field
  closeComment() {
    this.openform = false;
    return this.openform;
  }

  // Open Reply Input Field
  OpenReply(user_id) {
    this.index = user_id;
    this.reply = true;
    return this.reply;
  }

  // Close Reply Input Field
  CloseReply(user_id) {
    this.index = user_id;
    this.reply = false;
    return this.reply;
  }

  // Display Comments from Database
  discuss() {
    this.apollo
      .watchQuery<any>({
        query: gql`
          {
            discussions {
              id
              user_id
              comment
              replies
              problem_id
            }
          }
        `
      })
      .valueChanges.subscribe((log: any) => {
        this.data = log.data.discussions;
        // console.log(log);
      });
  }

  // Display Replies to Comments from Database
  replies() {
    this.apollo
      .watchQuery<any>({
        query: gql`
          {
            discussions {
              id
              user_id
              comment
              replies
              problem_id
            }
          }
        `
      })
      .valueChanges.subscribe((rep: any) => {
        this.putReply = rep.data.discussions;
        this.netReply = rep.data.discussions["2"].replies.user_id["0"];
        // console.log(this.netReply);
      });
  }

  // Post the Comment from the User
  saveForm(comment: NgForm): void {
    this.problemHandleService.addDiscussions(this.form);
    this.discuss();
    comment.reset();
  }

  post() {
    // console.log("Your reply to the Comment is posted !!!");
  }
  handleEnrichCardClicked(enrichmentData) {
    this.enrichmentDataToView = enrichmentData;
  }
  handleEnrichEditMode(enrichData) {
    this.enrichDataToEdit = enrichData;
    console.log(enrichData, "event on edit");
  }

  handleValidationCardClicked(validationData) {
    this.validationDataToView = validationData;
  }

  handleValidationEditMode(validationData) {
    this.validationDataToEdit = validationData;
  }

  handleCollaborationEditMode(collaborationData) {
    this.collaborationDataToEdit = collaborationData;
  }
  onCommentSubmit(event) {
    const [content, mentions] = event;
    console.log(content, mentions);
    this.discussionsService.submitCommentToDB({
      problem_id: this.problemData['id'],
      text: content,
      mentions: JSON.stringify(mentions).replace('[', '{').replace(']', '}')
    });
  }
}
