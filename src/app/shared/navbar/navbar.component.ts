import {
  Component,
  OnInit,
  Renderer,
  ViewChild,
  ElementRef,
  Input,
  Directive,
  OnDestroy
} from '@angular/core';
import { ROUTES } from '../.././sidebar/sidebar.component';
import { take } from 'rxjs/operators';
import { FilesService } from '../../services/files.service';

import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  NavigationStart
} from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import {
  Location,
  LocationStrategy,
  PathLocationStrategy
} from '@angular/common';
const misc: any = {
  navbar_menu_visible: 0,
  active_collapse: true,
  disabled_collapse_init: 0
};

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { Integer } from 'aws-sdk/clients/comprehendmedical';

declare var $: any;
@Component({
  selector: 'app-navbar-cmp',
  templateUrl: 'navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() userData: any;
  private listTitles: any[];
  objectValues = Object['values'];
  location: Location;
  mobile_menu_visible: any = 0;
  private nativeElement: Node;
  private toggleButton: any;
  private sidebarVisible: boolean;
  private _router: Subscription;

  user_id: any;
  notifications = {};
  url: any;
  id: any;
  update = [];
  getNotificationsSub: Subscription;
  @ViewChild('app-navbar-cmp') button: any;

  noResult = 'No Search Results';

  problemSearchResults: any;
  userSearchResults: any;

  constructor(
    location: Location,
    private renderer: Renderer,
    private element: ElementRef,
    public router: Router,
    private apollo: Apollo,
    public auth: AuthService,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private filesService: FilesService
  ) {
    this.location = location;
    this.nativeElement = element.nativeElement;
    this.sidebarVisible = false;
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

  hideSidebar() {
    const body = document.getElementsByTagName('body')[0];
    const sidebar = document.getElementsByClassName('sidebar')[0];

    if (misc.hide_sidebar_active === true) {
      setTimeout(function() {
        body.classList.remove('hide-sidebar');
        misc.hide_sidebar_active = false;
      }, 300);
      setTimeout(function() {
        sidebar.classList.remove('animation');
      }, 600);
      sidebar.classList.add('animation');
    } else {
      setTimeout(function() {
        body.classList.add('hide-sidebar');

        misc.hide_sidebar_active = true;
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

  ngOnInit() {
    this.user_id = this.auth.currentUserValue.id;

    this.listTitles = ROUTES.filter(listTitle => listTitle);

    const navbar: HTMLElement = this.element.nativeElement;
    const body = document.getElementsByTagName('body')[0];
    this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
    if (body.classList.contains('sidebar-mini')) {
      misc.sidebar_mini_active = true;
    }
    if (body.classList.contains('hide-sidebar')) {
      misc.hide_sidebar_active = true;
    }
    this._router = this.router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe((event: NavigationEnd) => {
        this.sidebarClose();

        const $layer = document.getElementsByClassName('close-layer')[0];
        if ($layer) {
          $layer.remove();
        }
      });

    this.getNotificationsSub = this.apollo
      .watchQuery<any>({
        query: gql`
          query {
            notifications(
              where: { user_id: { _eq: ${this.user_id} }, is_read: { _eq: false } }
            ) {
              id
              problem_id
              user_id
              is_update
              is_read
              solution_id
              enrichment_id
              collaborator
              discussion_id
              validated_by
              user_id
              tag_id
              tag{
                name
              }
              discussion{
                text
              }

              solution{
                title
              }
              problem {
                title
                problems_tags {
                  tag {
                    name
                  }
                }
              }
            }
          }
        `,
        pollInterval: 3000,
        fetchPolicy: 'network-only'
      })
      .valueChanges.subscribe(
        ({ data }) => {
          data.notifications.map(notification => {
            if (notification.discussion) {
              notification.discussion.text = notification.discussion.text.replace(
                /<[^>]*>/g,
                ''
              );
            }
            this.notifications[notification.id] = notification;
          });
        },
        err => {
          console.error(JSON.stringify(err));
        }
      );
  }

  onResize(event) {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }

  sidebarOpen() {
    const $toggle = document.getElementsByClassName('navbar-toggler')[0];
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName('body')[0];
    setTimeout(function() {
      toggleButton.classList.add('toggled');
    }, 500);
    body.classList.add('nav-open');
    setTimeout(function() {
      $toggle.classList.add('toggled');
    }, 430);

    const $layer = document.createElement('div');
    $layer.setAttribute('class', 'close-layer');

    if (body.querySelectorAll('.main-panel')) {
      if (document.getElementsByClassName('main-panel')[0]) {
        document.getElementsByClassName('main-panel')[0].appendChild($layer);
      }
    } else if (body.classList.contains('off-canvas-sidebar')) {
      document
        .getElementsByClassName('wrapper-full-page')[0]
        .appendChild($layer);
    }

    setTimeout(function() {
      $layer.classList.add('visible');
    }, 100);

    $layer.onclick = function() {
      // asign a function
      body.classList.remove('nav-open');
      this.mobile_menu_visible = 0;
      this.sidebarVisible = false;

      $layer.classList.remove('visible');
      setTimeout(function() {
        $layer.remove();
        $toggle.classList.remove('toggled');
      }, 400);
    }.bind(this);

    body.classList.add('nav-open');
    this.mobile_menu_visible = 1;
    this.sidebarVisible = true;
  }

  onRead(event) {
    const notification_id = Number(event.srcElement.name);

    delete this.notifications[notification_id];

    this.apollo
      .mutate<any>({
        mutation: gql`
          mutation set_read {
            update_notifications(
              where: { id: { _eq: ${notification_id} } }
              _set: { is_read: true }
            ) {
              affected_rows
              returning {
                is_read
              }
            }
          }
        `
      })
      .pipe(take(1))
      .subscribe(({ data }) => {});
  }

  allRead() {
    const notifications = [];

    Object.keys(this.notifications).map(notification_id => {
      const notification = this.notifications[notification_id];
      notifications.push({
        id: notification_id,
        user_id: notification.user_id,
        is_read: true
      });
      delete this.notifications[notification_id];
    });

    const upsert_notifications = gql`
      mutation upsert_notifications($objects: [notifications_insert_input!]!) {
        insert_notifications(
          objects: $objects
          on_conflict: {
            constraint: notifications_pkey
            update_columns: [is_read]
          }
        ) {
          affected_rows
          returning {
            is_read
          }
        }
      }
    `;
    this.apollo
      .mutate({
        mutation: upsert_notifications,
        variables: {
          objects: notifications
        }
      })
      .pipe(take(1))
      .subscribe(
        data => {},
        err => {
          console.error(JSON.stringify(err));
        }
      );
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

  sidebarToggle() {
    if (this.sidebarVisible === false) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }
  }

  getTitle() {
    const titlee: any = this.location.prepareExternalUrl(this.location.path());
    for (let i = 0; i < this.listTitles.length; i++) {
      if (
        this.listTitles[i].type === 'link' &&
        this.listTitles[i].path === titlee
      ) {
        return this.listTitles[i].title;
      } else if (this.listTitles[i].type === 'sub') {
        for (let j = 0; j < this.listTitles[i].children.length; j++) {
          const subtitle =
            this.listTitles[i].path + '/' + this.listTitles[i].children[j].path;
          if (subtitle === titlee) {
            return this.listTitles[i].children[j].title;
          }
        }
      }
    }
    return 'Dashboard';
  }

  getPath() {
    return this.location.prepareExternalUrl(this.location.path());
  }

  focus() {
    document.getElementById('search').focus();
  }

  openSearchComponent() {
    this.router.navigate(['/search'], { queryParamsHandling: 'preserve' });
    const searchBar = <HTMLBaseElement>(
      document.querySelector('input[name=searchInput]')
    );
    if (searchBar) {
      searchBar.focus();
    }
  }

  logout() {
    this.auth.logout();
  }

  ngOnDestroy() {
    this.getNotificationsSub.unsubscribe();
  }
}
