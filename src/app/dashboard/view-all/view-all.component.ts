import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TestBed } from '@angular/core/testing';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-view-all',
  templateUrl: './view-all.component.html',
  styleUrls: ['./view-all.component.css']
})
export class ViewAllComponent implements OnInit {
  viewProblemsAndSolutions: Boolean = false;
  dashboardData: any;
  title: string;
  displayUsers: boolean = false;
  solutions: any[] = [];
  solutionContributions = [];

  viewProblems = true;
  viewSolutions = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UsersService
  ) {}

  ngOnInit() {
    this.route.params.pipe(first()).subscribe(params => {
      if (params.type == 'drafts') {
        this.viewProblemsAndSolutions = true;
        this.title = 'You are working on these drafts';
        this.dashboardData = this.userService.dashboardDrafts;
        this.solutions = this.userService.solutionDrafts;
      }
      if (params.type == 'problems') {
        this.title = 'Problems added by you';
        this.dashboardData = this.userService.dashboardUserProblems;
      }
      if (params.type == 'solutions') {
        this.title = 'Solutions added by you';
        this.viewSolutions = true;
        this.dashboardData = this.userService.dashboardUserSolutions;
      }
      if (params.type == 'contributions') {
        this.title = 'Your contributions';
        this.viewProblemsAndSolutions = true;

        this.dashboardData = Object.values(
          this.userService.dashboardContributions
        );
        this.solutions = Object.values(
          this.userService.dashboardSolutionContributions
        );
      }
      if (params.type == 'interests') {
        this.title = 'Problems you may be interested in';
        this.dashboardData = Object.values(
          this.userService.dashboardRecommendations
        );
      }
      if (params.type == 'users') {
        this.title = 'People with similar interests';
        this.displayUsers = true;
        this.dashboardData = Object.values(this.userService.dashboardUsers);
      }
    });
  }
  showProblems(event) {
    this.viewProblems = event;
  }
}
