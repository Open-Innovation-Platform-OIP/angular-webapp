import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  ChangeDetectorRef,
  OnDestroy,
  Inject,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  Location,
  LocationStrategy,
  PathLocationStrategy
} from '@angular/common';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, Subscription, interval, Subject } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { domain } from '../../../environments/environment';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { FilterService } from '../../services/filter.service';
import { TagsService } from '../../services/tags.service';

import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';

import {
  first,
  finalize,
  startWith,
  take,
  map,
  switchMap
} from 'rxjs/operators';

import { ProblemService } from '../../services/problem.service';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';

import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import swal from 'sweetalert2';
import { NgForm } from '@angular/forms';
import { NguCarouselConfig } from '@ngu/carousel';
import { slider } from './solution-detail.animation';
import { DiscussionsService } from 'src/app/services/discussions.service';
import { FilesService } from 'src/app/services/files.service';
import { CollaborationService } from 'src/app/services/collaboration.service';
import { ValidationService } from 'src/app/services/validation.service';
import { EnrichmentService } from 'src/app/services/enrichment.service';
import { sharing } from '../../globalconfig';
import { FocusMonitor } from '@angular/cdk/a11y';
const Buffer = require('buffer/').Buffer;

const misc: any = {
  navbar_menu_visible: 0,
  active_collapse: true,
  disabled_collapse_init: 0
};

declare var $: any;
interface attachment_object {
  key: string;
  fileEndpoint: string;
  mimeType: string;
}
interface queryString {
  commentId: number;
}

@Component({
  selector: 'app-solution-detail',
  providers: [
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy }
  ],
  templateUrl: './solution-detail.component.html',
  styleUrls: ['./solution-detail.component.css'],
  animations: [slider],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SolutionDetailComponent implements OnInit {
  @ViewChild('solutionTitle') solutionTitle: ElementRef<HTMLElement>;

  channels = sharing;
  imageAlt = 'Default image';
  discussionContext: string;
  lastContext = new Subject();
  // chartData: any;
  message: any;
  popup: any;
  watchers = new Set();
  voters = new Set();
  solutionDataQuery: QueryRef<any>;
  userDataQuery: QueryRef<any>;

  solutionDataSubcription: any;
  objectValues = Object['values'];
  discussions = [];
  replyingTo = 0;
  showReplyBox = false;
  showCommentBox = false;
  numOfComments = 5;
  problems = [];
  solutionLocations = [];

  owners = new Set();
  ownerData: any = [];

  solutionData = {
    id: '',
    title: '',
    description: '',
    technology: '',
    impact: '',
    website_url: '',
    deployment: 0,

    budget_title: '',
    min_budget: 0,
    max_budget: 0,
    image_urls: [],
    video_urls: [],
    featured_url: '',
    embed_urls: [],
    featured_type: '',
    user_id: 0,
    is_draft: true,
    attachments: [],
    organization: '',
    resources: '',
    timeline: '',
    pilots: ''
  };

  problemData: any = {
    id: '',
    title: '',
    description: '',
    organization: '',
    impact: '',
    extent: '',

    min_population: 0,
    max_population: 0,
    beneficiary_attributes: '',
    resources_needed: '',
    image_urls: [],
    video_urls: [],
    featured_url: '',
    embed_urls: [],
    featured_type: '',
    voted_by: '',
    user_id: '',
    is_draft: '',
    attachments: []
  };

  public solutionOwner: string;

  enrichDataToEdit: any;
  tags: any = [];
  sectorMatched = false;
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

  modalImgSrc: String;
  modalVideoSrc: String;
  solution_attachments: any[] = [];
  solution_attachments_index = 0;
  solution_attachments_src: any;
  modalSrc: any;
  sources: any;
  singleImg = false;

  imgUrlIndex = 0;
  videoUrlIndex = 0;
  disableEnrichButton = false;
  disableValidateButton = false;
  disableCollaborateButton = false;

  private listTitles: any[];
  location: Location;
  mobile_menu_visible: any = 0;
  private nativeElement: Node;
  private toggleButton: any;
  private sidebarVisible: boolean;
  private _router: Subscription;
  displayEnrichForm: boolean;
  showCollaborators: boolean;
  hideProblemDetail = true;
  collaboratorProfileInfo: any;
  comments = {};
  replies = {};
  popularDiscussions: any = [];
  popular: boolean;
  collaboratorIntent: any;
  pageUrl = '';
  mailToLink = '';

  fabTogglerState = false;

  // Carousel
  @Input() name: string;
  userId: Number;

  validationDataToView: any;
  validationDataToEdit: any;
  validation: any = [];
  collaborators: any = [];
  collaboratorDataToEdit: any;
  interval = null;
  qs: queryString = { commentId: 0 };

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
    public auth: AuthService,
    public usersService: UsersService,
    public filesService: FilesService,
    private discussionsService: DiscussionsService,
    private collaborationService: CollaborationService,
    private validationService: ValidationService,
    private enrichmentService: EnrichmentService,
    public ngLocation: Location,
    private ngxService: NgxUiLoaderService,
    public dialog: MatDialog,
    private filterService: FilterService,
    private tagsService: TagsService,
    private focusMonitor: FocusMonitor
  ) {
    this.startInterval();
    this.pageUrl = domain + ngLocation.path();
    const subject = encodeURI('Can you help solve this problem?');
    const body = encodeURI(
      `Hello,\n\nCheck out this link on Social Alpha's Open Innovation platform - ${this.pageUrl}\n\nRegards,`
    );
    this.mailToLink = `mailto:?subject=${subject}&body=${body}`;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.focusMonitor.focusVia(this.solutionTitle, 'program');
    }, 100);
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
              users_tags{
                tag {
                    id
                    name
                }
            }
            }
        }

        `,
      fetchPolicy: 'network-only',
      pollInterval: 1000
    });

    this.userDataQuery.valueChanges.pipe(take(1)).subscribe(
      result => {
        if (result.data.users[0]) {
          Object.keys(result.data.users[0]).map(persona => {
            this.userPersonas[persona] = result.data.users[0][persona];
          });

          result.data.users[0].users_tags.map(tag => {
            this.userInterests[tag.tag.name] = tag.tag;
          });
        }
      },
      error => {
        console.error(JSON.stringify(error));
      }
    );
  }

  loadCarousels() {
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

    this.route.queryParams.subscribe(params => {
      if (params.commentId) {
        this.qs.commentId = params.commentId;
      }
    });

    this.solutionDataSubcription = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.getSolutionData(params.get('id'));
      })
    );
    this.solutionDataSubcription.subscribe(
      result => {
        if (result.data.solutions.length >= 1 && result.data.solutions[0].id) {
          const solutionData = result.data.solutions[0];

          this.parseSolution(solutionData);
        }
      },

      error => {
        console.error(JSON.stringify(error));
      }
    );
  }

  getSolutionData(id) {
    this.solutionDataQuery = this.apollo.watchQuery<any>({
      query: gql`
      {
        solutions(where: { id: { _eq: ${id} } }) {
          id

    title
    description
    user_id
    resources
    timeline
    pilots
    beneficiary_attributes


    impact
    technology
    website_url
    deployment

    budget_title
    min_budget
    max_budget

    image_urls
    video_urls
    featured_url
    embed_urls
    featured_type
    solution_watchers{
      user_id
    }
    solution_voters{
      user_id
    }
    solutions_tags{
      tag {
          id
          name
      }
  }

    solution_validations(order_by:{edited_at: desc}){
      user_id
      comment
      agree
      created_at
      files

      edited_at
      is_deleted

      solution_id
      user {
        id
        name
      }

    }

    solution_collaborators(order_by:{edited_at: desc}){
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

    solution_owners {
      user_id
      user{
        id
        name
      }
    }

    discussions(where: { is_deleted: { _eq: false} },order_by: {created_at: desc}) {
      id
      user_id
      created_at
      edited_at
      text
      is_deleted
      linked_comment_id
      attachments
      user {
        name
        photo_url
      }
      discussion_voters{
        user_id
        discussion_id
      }
    }

    problems_solutions{
      problem{
        id
            title
            description

            resources_needed
            image_urls
            edited_at
            updated_at

            featured_url

            is_deleted

            problem_locations{
              location{
                id
                          location_name
                          location
                           lat
                           long
                           city
                           country
                           state
                           type
              }
            }

            problem_voters {
              problem_id
              user_id
            }
            problem_watchers {
              problem_id
              user_id
            }
            problem_validations {
              user_id
            }

      }

    }




    attachments
    user{
      name
    }


    }
  }

    `,
      pollInterval: 1000,
      fetchPolicy: 'network-only'
    });

    return this.solutionDataQuery.valueChanges;
  }

  fbShare() {
    window.open(
      'https://www.facebook.com/sharer/sharer.php?u=' + this.pageUrl,
      'facebook-popup',
      'height=350,width=600'
    );
  }

  twitterShare() {
    window.open(
      'https://twitter.com/share?url=' + this.pageUrl,
      'twitter-popup',
      'height=350,width=600'
    );
  }

  linkedInShare() {
    window.open(
      'https://www.linkedin.com/shareArticle?mini=true&url=' + this.pageUrl,
      'linkedin-popup',
      'height=350,width=600'
    );
  }

  mailShare() {
    // not a great approach as the popup doesn't autoclose. Better to use href on button click.
    const subject = encodeURI('Check out this solution');
    const body = encodeURI(
      `Hello,\n\nCheck out this link on Social Alpha's Open Innovation platform - ${this.pageUrl}\n\nRegards,`
    );
    const href = `mailto:?subject=${subject}&body=${body}`;
    this.popup = window.open(href, 'email-popup', 'height=350,width=600');
  }

  smsShare() {
    const url = 'https://sa-sms-microservice.dev.jaagalabs.com/send';
    const data = {
      text: `Check out this solution? ${this.pageUrl}`,
      numbers: prompt('Enter phone numbers separated by commas.').split(',')
    };
    // Default options are marked with *
    return fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      // mode: "cors", // no-cors, cors, *same-origin
      // cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: "same-origin", // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'socialalpha'
      },
      // redirect: "follow", // manual, *follow, error
      // referrer: "no-referrer", // no-referrer, *client
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
      .then(response => {
        alert('Your message has been sent');
      }) // parses JSON response into native Javascript objects
      .catch(e => {
        console.error('SMS error', e);
      });
  }

  shareComment(shareObj) {
    this.pageUrl += `?commentId=${shareObj.id}`;

    switch (shareObj.platform) {
      case 'linkedin':
        this.linkedInShare();
        break;
      case 'facebook':
        this.fbShare();
        break;
      case 'twitter':
        this.twitterShare();
        break;
      case 'email':
        this.mailShare();
        break;
      case 'sms':
        this.smsShare();
        break;

      default:
        break;
    }

    this.pageUrl = domain + this.ngLocation.path();
  }

  //

  parseSolution(solution) {
    if (solution.title) {
      this.message = solution.title;
    }

    // map core keys
    Object.keys(this.solutionData).map(key => {
      this.solutionData[key] = solution[key];
    });

    this.solutionOwner = solution.user.name;

    if (solution.problems_solutions) {
      this.solutionLocations = [];

      solution.problems_solutions.map(problems => {
        const locations = problems.problem.problem_locations.map(location => {
          this.solutionLocations.push(location.location);
        });
      });
    }

    if (solution.solutions_tags) {
      this.tags = solution.solutions_tags.map(tagArray => {
        return tagArray.tag;
      });
    }
    solution.solution_watchers.map(watcher => {
      this.watchers.add(watcher.user_id);
    });
    solution.solution_voters.map(voter => {
      this.voters.add(voter.user_id);
    });

    solution.solution_validations.map(validation => {
      if (validation.user_id === Number(this.auth.currentUserValue.id)) {
        this.disableValidateButton = true;
      }
    });
    this.validation = solution.solution_validations;

    solution.solution_collaborators.map(collaborator => {
      if (collaborator.user_id === Number(this.auth.currentUserValue.id)) {
        this.disableCollaborateButton = true;
      }
    });

    this.problems = solution.problems_solutions.map(problemData => {
      return problemData.problem;
    });

    this.collaborators = solution.solution_collaborators;

    this.loadCarousels();

    solution.solutions_tags.map(tags => {
      if (this.userInterests[tags.tag.name]) {
        this.sectorMatched = true;
      }
    });

    this.ownerData = solution.solution_owners.map(owner => {
      this.owners.add(owner.user_id);

      return owner.user;
    });

    // adding embed urls

    const embedded_urls_arr = this.solutionData.embed_urls.map(url => {
      return { url: url };
    });

    // combining the video_urls and image_urls
    this.solution_attachments = [
      ...this.solutionData['image_urls'],
      ...this.solutionData['video_urls'],
      ...this.solutionData['attachments'],
      ...embedded_urls_arr
    ];

    this.solution_attachments_src = this.solution_attachments[
      this.solution_attachments_index
    ];

    solution.discussions.map(comment => {
      if (comment.linked_comment_id) {
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

        this.comments[comment.id] = comment;
        if (!this.replies[comment.id]) {
          this.replies[comment.id] = []; // create an empty array for replies to this comment
        }
      }
    });

    this.popularDiscussions = Object.keys(this.replies)
      .sort((a, b) => {
        let dateA;
        let dateB;
        // sorting by date
        if (this.comments[a]) {
          dateA = this.comments[a].edited_at;
        }
        if (this.comments[b]) {
          dateB = this.comments[b].edited_at;
        }
        if (dateA < dateB) {
          return 1;
        }
        if (dateA > dateB) {
          return -1;
        }

        return 0;
      })
      .sort((a, b) => {
        // sorting by no. of replies
        return this.replies[b].length - this.replies[a].length;
      })
      .filter(commentId => this.comments[commentId]) // to avoid undefined
      .map(commentId => this.comments[commentId]); //mapping the sorted array
  }

  removeDuplicateReplies(_replies: any[]) {
    return _replies.filter(
      (item, index, self) => index === self.findIndex(t => t.id === item.id)
    );
  }

  sortComments(comments) {
    const sortByDate = comments.sort(this.compareDateForSort);
    const sharedComment = comments.filter(comment => {
      if (this.qs.commentId) {
        return comment.id === Number(this.qs.commentId);
      }
    });

    const sortedComments = this.removeDuplicateReplies([
      ...sharedComment,
      ...sortByDate
    ]);

    if (comments.length < 4) {
      return sortedComments;
    } else {
      return sortedComments.splice(0, this.numOfComments);
    }
  }

  deleteComment(comment) {
    const deleteResp = this.discussionsService.deleteCommentsFromDB(comment.id);
    deleteResp.subscribe(
      result => {
        if (
          this.comments.hasOwnProperty(comment.id) &&
          !this.comments[comment.id].linked_comment_id
        ) {
          delete this.comments[comment.id];
        } else if (this.replies.hasOwnProperty(comment.linked_comment_id)) {
          this.replies[comment.linked_comment_id].forEach((reply, index) => {
            if (reply.linked_comment_id === comment.linked_comment_id) {
              if (index < 1) {
                this.replies[comment.linked_comment_id] = [];
              } else {
                this.replies[comment.linked_comment_id].splice(0, index);
              }
              return;
            }
          });
        }
      },
      err => {
        console.error(JSON.stringify(err));
      }
    );
  }

  showMoreComments() {
    if (this.numOfComments < this.objectValues(this.comments).length) {
      this.numOfComments += 10;
      this.sortComments(this.objectValues(this.comments));
    }
  }

  compareDateForSort(a, b) {
    const dateA = a.edited_at;
    const dateB = b.edited_at;
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
  }

  checkUrlIsImg(url) {
    const arr = ['jpeg', 'jpg', 'gif', 'png'];
    const ext = url.substring(url.lastIndexOf('.') + 1);
    if (arr.indexOf(ext) > -1) {
      return true;
    } else {
      return false;
    }
  }

  toggleSolutionAttachmentsIndex(dir: boolean) {
    if (
      dir &&
      this.solution_attachments_index < this.solution_attachments.length - 1
    ) {
      this.solution_attachments_index++;
      this.solution_attachments_src = this.solution_attachments[
        this.solution_attachments_index
      ];
    } else if (!dir && this.solution_attachments_index > 0) {
      this.solution_attachments_index--;
      this.solution_attachments_src = this.solution_attachments[
        this.solution_attachments_index
      ];
    }
  }

  showSwal(type) {
    if (type == 'input-field') {
      swal({
        title: 'Validate Problem',
        html:
          '<div class="form-group">' +
          '<input id="input-field" type="text" placeholder="Enter your text here" class="form-control" />' +
          '</div>',
        showCancelButton: true,
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger',
        buttonsStyling: false
      })
        .then(function(result) {
          swal({
            type: 'success',
            html:
              'You entered: <strong>' + $('#input-field').val() + '</strong>',
            confirmButtonClass: 'btn btn-success',
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
      actionBtn === 'next' &&
      this.videoUrlIndex < this.problemData.video_urls.length - 1
    ) {
      this.videoUrlIndex++;
      this.modalVideoSrc = this.problemData.video_urls[this.videoUrlIndex].url;
    } else if (actionBtn === 'prev' && this.videoUrlIndex > 0) {
      this.videoUrlIndex--;
      this.modalVideoSrc = this.problemData.video_urls[this.videoUrlIndex].url;
    }
  }

  minimizeSidebar() {
    const body = document.getElementsByTagName('body')[0];

    if (misc.sidebar_mini_active === true) {
      body.classList.remove('sidebar-mini');
      misc.sidebar_mini_active = false;
    } else {
      setTimeout(function() {
        body.classList.add('sidebar-mini');

        misc.sidebar_mini_active = true;
      }, 300);
    }

    // we simulate the window Resize so the charts will get updated in realtime.
    const simulateWindowResize = setInterval(function() {
      window.dispatchEvent(new Event('resize'));
    }, 180);

    // we stop the simulation of Window Resize after the animations are completed
    setTimeout(function() {
      clearInterval(simulateWindowResize);
    }, 1000);
  }

  dimissVideoModal(e) {
    if (e.type === 'click') {
      const problemVideoTag: HTMLMediaElement = document.querySelector(
        '#problemVideoID'
      );
      problemVideoTag.pause();
    }
  }

  sidebarClose() {
    const $toggle = document.getElementsByClassName('navbar-toggler')[0];
    const body = document.getElementsByTagName('body')[0];
    this.toggleButton.classList.remove('toggled');
    const $layer = document.createElement('div');
    $layer.setAttribute('class', 'close-layer');

    this.sidebarVisible = false;
    body.classList.remove('nav-open');

    body.classList.remove('nav-open');
    if ($layer) {
      $layer.remove();
    }

    setTimeout(function() {
      $toggle.classList.remove('toggled');
    }, 400);

    this.mobile_menu_visible = 0;
  }
  toggleWatchSolution() {
    if (
      !(this.userId == this.solutionData.user_id) &&
      this.auth.currentUserValue.id
    ) {
      if (!this.watchers.has(this.userId)) {
        // user is not currently watching this problem
        // let's add them
        this.watchers.add(this.userId);
        const add_watcher = gql`
        mutation insert_solution_watcher {
          insert_solution_watchers(
            objects: [
              {
                user_id: ${Number(this.userId)},
                solution_id: ${Number(this.solutionData.id)},
              }
            ]
          ) {
            returning {
              user_id

            }
          }
        }
      `;
        this.apollo
          .mutate({
            mutation: add_watcher
          })
          .pipe(take(1))
          .subscribe(
            result => {
              if (result.data) {
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
        mutation delete_solution_watcher {
          delete_solution_watchers(
            where: {user_id: {_eq: ${Number(
              this.userId
            )}}, solution_id: {_eq: ${Number(this.solutionData.id)}}}
          ) {
            affected_rows
          }
        }
      `;
        this.apollo
          .mutate({
            mutation: delete_watcher
          })
          .pipe(take(1))
          .subscribe(
            result => {
              if (result.data) {
              }
            },
            err => {
              console.error(JSON.stringify(err));
            }
          );
      }
    }
  }

  toggleVoteSolution() {
    if (
      !(this.userId == this.solutionData.user_id) &&
      this.auth.currentUserValue.id
    ) {
      if (!this.voters.has(this.userId)) {
        // user is not currently watching this problem
        // let's add them
        this.voters.add(this.userId);
        const add_voter = gql`
        mutation insert_solution_voter {
          insert_solution_voters(
            objects: [
              {
                user_id: ${Number(this.userId)},
                solution_id: ${Number(this.solutionData.id)},
              }
            ]
          ) {
            returning {
              user_id
              solution_id
            }
          }
        }
      `;
        this.apollo
          .mutate({
            mutation: add_voter
          })
          .pipe(take(1))
          .subscribe(
            result => {
              if (result.data) {
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
        mutation delete_solution_voter {
          delete_solution_voters(
            where: {user_id: {_eq: ${Number(
              this.userId
            )}}, solution_id: {_eq: ${Number(this.solutionData.id)}}}
          ) {
            affected_rows
          }
        }
      `;
        this.apollo
          .mutate({
            mutation: delete_voter
          })
          .pipe(take(1))
          .subscribe(
            result => {
              if (result.data) {
              }
            },
            err => {
              console.error(JSON.stringify(err));
              swal({
                title: 'Error',
                text: 'Try Again',
                type: 'error',
                confirmButtonClass: 'btn btn-info',
                buttonsStyling: false
              }).catch(swal.noop);
            }
          );
      }
    }
  }

  onCollaborationSubmit(collaborationData) {
    collaborationData.user_id = Number(this.auth.currentUserValue.id);

    collaborationData.solution_id = this.solutionData.id;

    this.collaborationService.submitSolutionCollaboratorToDB(collaborationData);

    // close modal
    // send to db
  }

  onValidationSubmit(validationData) {
    validationData.user_id = Number(this.auth.currentUserValue.id);

    validationData.solution_id = this.solutionData.id;

    this.validationService.submitSolutionValidationToDB(validationData);
    this.startInterval();
  }

  deleteValidation(validationData) {
    this.validationService.deleteSolutionValidation(validationData).subscribe(
      ({ data }) => {
        $('#validModal').modal('hide');
        this.disableValidateButton = false;

        return;
      },
      error => {
        console.error('Could delete due to ' + error);
        swal({
          title: 'Error',
          text: 'Try Again',
          type: 'error',
          confirmButtonClass: 'btn btn-info',
          buttonsStyling: false
        }).catch(swal.noop);
      }
    );
  }

  deleteCollaboration(collaborationData) {
    this.collaborationService
      .deleteSolutionCollaboration(collaborationData)
      .subscribe(
        ({ data }) => {
          $('#collaboratorModal').modal('hide');
          this.disableCollaborateButton = false;
        },
        error => {
          console.error(JSON.stringify(error));

          swal({
            title: 'Error',
            text: 'Try Again',
            type: 'error',
            confirmButtonClass: 'btn btn-info',
            buttonsStyling: false
          }).catch(swal.noop);
        }
      );
  }

  handleValidationCardClicked(validationData) {
    this.validationDataToView = validationData;
  }

  handleValidationEditMode(validationData) {
    this.validationDataToEdit = validationData;

    $('#EditValidationModal').modal({
      backdrop: 'static',
      keyboard: false
    });

    $('#EditValidationModal').modal('show');
  }

  handleCollaborationEditMode(collaborationData) {
    this.collaboratorDataToEdit = collaborationData;
  }

  async onCommentSubmit(event, comment_id?) {
    const [content, mentions, attachments] = event;

    let file_links: attachment_object[];
    let _links = []; //local array

    const all_promise = await attachments.map(file => {
      return new Promise((resolve, reject) => {
        if (typeof FileReader !== 'undefined') {
          const reader = new FileReader();

          reader.onload = (e: any) => {
            const buffer = Buffer.from(e.target.result);
            resolve(this.filesService.fileUpload(file, file.type));
          };
          reader.readAsArrayBuffer(file);
        }
      });
    });

    try {
      _links = await Promise.all(all_promise);
    } catch (error) {
      console.error('Err while uploading reply files', error);
    }

    if (_links.length) {
      file_links = [];

      _links.forEach((link, i) => {
        file_links.push({
          key: attachments[i].name,
          fileEndpoint: link.fileEndpoint,
          mimeType: attachments[i].type
        });
      });
    }

    this.submitComment(content, mentions, file_links, comment_id);
  }

  submitComment(content, mentions, attachments?, comment_id?) {
    const comment = {
      user_id: this.auth.currentUserValue.id,
      solution_id: this.solutionData['id'],
      text: content,
      attachments: attachments // overwriting the incoming blobs
    };
    if (comment_id) {
      comment['linked_comment_id'] = comment_id;
    }

    if (this.showReplyBox) {
      comment['linked_comment_id'] = this.replyingTo;
      this.replyingTo = 0;
      this.showReplyBox = false;
    }

    this.discussionsService.submitCommentToDB(comment, mentions);
  }

  checkIntent(event) {
    this.collaboratorIntent = event;
  }

  dismiss() {
    if (this.collaboratorIntent) {
      swal({
        title: 'Are you sure you want to leave?',

        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger',
        confirmButtonText: 'Yes',
        buttonsStyling: false
      }).then(result => {
        if (result.value) {
          $('#collaboratorModal').modal('hide');
        }
      });
    } else {
      $('#collaboratorModal').modal('hide');
    }
  }

  displayModal(files: {
    attachmentObj: attachment_object;
    index: number;
    context: string;
  }) {
    this.sources = files;
    this.modalSrc = files.attachmentObj[files.index];
    this.discussionContext = files.context;

    clearInterval(this.interval);
    /* opening modal */
    $('#enlargeView').modal({
      backdrop: 'static',
      keyboard: false
    });

    const waitForTag = setInterval(() => {
      const modalBtnTag: HTMLElement = document.querySelector(
        '#discussionModalNextBtn'
      );
      const closeBtn: HTMLElement = document.querySelector(
        '#discussionModalNextBtn'
      );

      if (modalBtnTag) {
        this.focusMonitor.focusVia(modalBtnTag, 'program');
        clearInterval(waitForTag);
      }
      if (closeBtn) {
        this.focusMonitor.focusVia(closeBtn, 'program');
        clearInterval(waitForTag);
      }
    }, 500);

    $('#enlargeView').modal('show');
  }

  closeModal(e) {
    if (e.type === 'click') {
      const solutionVideoTag: HTMLMediaElement = document.querySelector(
        '#modalVideo'
      );

      this.startInterval();
      if (solutionVideoTag) {
        solutionVideoTag.pause();
      }
    }

    this.lastContext.next(this.discussionContext);
  }

  toggleFileSrc(dir: boolean) {
    if (
      dir &&
      this.sources['index'] < this.sources['attachmentObj'].length - 1
    ) {
      this.sources['index']++;
      this.modalSrc = this.sources['attachmentObj'][this.sources['index']];
    } else if (!dir && this.sources['index'] > 0) {
      this.sources['index']--;
      this.modalSrc = this.sources['attachmentObj'][this.sources['index']];
    }
  }

  openModal(id) {
    clearInterval(this.interval);

    /* opening modal */
    $(id).modal({
      backdrop: 'static',
      keyboard: false
    });

    $(id).modal('show');
  }

  showPopularDiscussions(id) {
    if (id == 'popular') {
      this.popular = true;
    } else if (id == 'latest') {
      this.popular = false;
    }
  }

  showNotification(from: any, align: any, title: any) {
    const type = [
      '',
      'info',
      'success',
      'warning',
      'danger',
      'rose',
      'primary'
    ];

    const color = Math.floor(Math.random() * 6 + 1);

    $.notify(
      {
        icon: 'notifications',
        message: title
      },
      {
        type: type[color],
        timer: 30000,
        placement: {
          from: from,
          align: align
        },
        template:
          '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
          '<button mat-raised-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
          '<i class="material-icons" data-notify="icon">notifications</i> ' +
          '<span data-notify="title">{1}</span> ' +
          '<span data-notify="message">{2}</span>' +
          '<div class="progress" data-notify="progressbar">' +
          '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
          '</div>' +
          '<a href="{3}" target="{4}" data-notify="url"></a>' +
          '</div>'
      }
    );
  }

  sectorSelected(sector) {
    this.router.navigate(['/solutions'], {
      queryParams: { [sector.name]: 'sectorFilter' },
      queryParamsHandling: 'merge'
    });
  }
  openInviteModal(): void {
    const inviteModalRef = this.dialog.open(ModalComponent, {
      width: '500px',
      data: {}
    });

    inviteModalRef.afterClosed().subscribe(result => {});
  }

  locationSelected(location) {
    const locationQuery = {
      location_name: location.location_name,
      latitude: location.lat,
      longitude: location.long,
      state: location.state,
      city: location.city,
      country: location.country,
      type: location.type
    };

    this.router.navigate(['/solutions'], {
      queryParams: { ['filterLocation']: JSON.stringify(locationQuery) },
      queryParamsHandling: 'merge'
    });
  }

  ngOnDestroy() {
    this.solutionDataQuery.stopPolling();
    this.solutionDataSubcription.unsubscribe();

    this.userDataQuery.stopPolling();
  }
}
