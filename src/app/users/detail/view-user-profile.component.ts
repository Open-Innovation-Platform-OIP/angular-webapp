import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ElementRef
} from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { AuthService } from '../../services/auth.service';
import { FilesService } from '../../services/files.service';
import { FocusMonitor } from '@angular/cdk/a11y';

@Component({
  selector: 'app-view-user-profile',
  templateUrl: './view-user-profile.component.html',
  styleUrls: ['./view-user-profile.component.css']
})
export class ViewUserProfileComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('profileTitle') profileTitle: ElementRef<HTMLElement>;
  user: any;
  userData: any = {};
  userDataQuery: QueryRef<any>;

  interests: any[] = [];
  loggedInUsersProfile = false;
  objectEntries = Object.entries;
  personas: any = [];
  userId: any;
  organizationName: any;

  constructor(
    private route: ActivatedRoute,
    private apollo: Apollo,
    private auth: AuthService,
    private filesService: FilesService,
    private focusMonitor: FocusMonitor
  ) {
    // this.route.params.pipe(first()).subscribe(params => {
    //   console.log(params.id, "params id");
    //   if (params.id) {
    //     this.getProfile(params.id);
    //   }
    // });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.focusMonitor.focusVia(this.profileTitle, 'program');
    }, 1000);
  }

  ngOnInit() {
    console.log('init on user profile');
    this.user = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        console.log('result');

        return this.getProfile(params.get('id'));
      })
    );
    this.user.subscribe(
      result => {
        this.interests = [];
        this.personas = [];
        console.log(result, 'result');
        if (result.data.users[0]) {
          this.userData = result.data.users[0];
          Object.entries(this.userData).map(data => {
            if (typeof data[1] === 'boolean' && data[1]) {
              this.personas.push(data[0]);
            }
          });

          if (result.data.users[0].organizationByOrganizationId) {
            this.organizationName =
              result.data.users[0].organizationByOrganizationId.name;
          }
          if (result.data.users[0].users_tags) {
            this.interests = result.data.users[0].users_tags.map(tagArray => {
              return tagArray.tag.name;
            });
          }
        }
      },
      error => {
        console.error(JSON.stringify(error));
      }
    );
  }

  getProfile(id) {
    this.userDataQuery = this.apollo.watchQuery<any>({
      query: gql`
          {
            users(where: { id: { _eq: ${id} } }) {
              id
              organization
              name
              qualification
              photo_url
              email
              phone_number
              is_ngo
              is_innovator
              is_entrepreneur
              is_expert
              is_incubator
              is_funder
              is_government
              is_beneficiary 
              user_locations{
                location{
                  location_name
                }

              }

              problems(where: { is_draft: { _eq: false } }){
                id
              }
              problem_collaborators{
                intent
              }
              problem_validations{
                comment
              }

              solution_validations{
                user_id
              }

              solution_collaborators {
                user_id
              }
              enrichments(where: { is_deleted: { _eq: false } }){
                id
              }
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
      fetchPolicy: 'no-cache',

      pollInterval: 1000
    });

    return this.userDataQuery.valueChanges;
  }

  adminSelection(event, row) {
    console.log(event, 'event');
    console.log(row, 'row');
  }

  ngOnDestroy() {
    this.userDataQuery.stopPolling();
    this.focusMonitor.stopMonitoring(this.profileTitle);
    // this.user.unsubscribe();
  }
}
