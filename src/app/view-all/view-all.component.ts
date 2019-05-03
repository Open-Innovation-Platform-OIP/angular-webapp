import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { first, finalize } from "rxjs/operators";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { TestBed } from "@angular/core/testing";
import { ProblemService } from "../services/problem.service";

@Component({
  selector: "app-view-all",
  templateUrl: "./view-all.component.html",
  styleUrls: ["./view-all.component.css"]
})
export class ViewAllComponent implements OnInit {
  dashboardData: any;
  title: string;
  displayUsers: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private problemService: ProblemService
  ) {}

  ngOnInit() {
    this.route.params.pipe(first()).subscribe(params => {
      if (params.type == "drafts") {
        this.title = "You are working on these drafts";
        this.dashboardData = this.problemService.dashboardDrafts;
      }
      if (params.type == "problems") {
        this.title = "Problems added by you";
        this.dashboardData = this.problemService.dashboardUserProblems;
      }
      if (params.type == "contributions") {
        this.title = "Your contributions";
        this.dashboardData = Object.values(
          this.problemService.dashboardContributions
        );
      }
      if (params.type == "interests") {
        this.title = "Problems you may be interested in";
        this.dashboardData = Object.values(
          this.problemService.dashboardRecommendations
        );
      }
      if (params.type == "users") {
        this.title = "People with similar interests";
        this.displayUsers = true;
        this.dashboardData = Object.values(this.problemService.dashboardUsers);
      }
    });
  }
}
