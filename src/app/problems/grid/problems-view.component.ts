import { Component, OnInit, Input } from "@angular/core";
import * as Query from '../../services/queries';
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Observable } from "rxjs";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: "app-problems-view",
  templateUrl: "./problems-view.component.html",
  styleUrls: ["./problems-view.component.css"]
})
export class ProblemsViewComponent implements OnInit {
  // @Input() Enr: any;
  tags: any[];
  problems: any;
  autoComplete: any[] = [];
  items = [];
  tagMatchedInDb: boolean = false;
  tagsToBeAddedInDb: any[] = [];
  form = {
    searchT: null
  };
  sea: any;
  constructor(private apollo: Apollo, private auth: AuthService) {}

  ngOnInit() {
    console.log("component ngoninit", typeof localStorage.getItem("userId"));

    this.problems = this.apollo.watchQuery<any>({
      query: Query.GetQuery
    }).valueChanges;

    console.log(
      "problem view component works",
      typeof localStorage.getItem("jwt")
    );
    // this.auth.logout();s
  }
  onItemAdded(event) {
    console.log(this.items, "items");
  }

  onTextChange(text) {
    if (text.length > 2) {
      this.apollo
        .watchQuery<any>({
          query: gql`query { tags( where: {name: {_similar: "(${text})%"}} ) { id name } }`
        })
        .valueChanges.subscribe(({ data }) => {
          // this.problems = data.Problems;
          // console.log(data, "problems on view component");
          this.autoComplete = data.tags.map(tag => {
            console.log(this.items, "autocomplete array");

            return tag.name;
          });
        });
    }
  }
  logout() {
    this.auth.logout();
  }

  sa() {
    console.log("Your Search Term is : ", this.form.searchT);
    this.apollo
      .watchQuery<any>({
        query: gql`query {
          search_problems(
          args: {search: "${this.form.searchT}"}
          ){
          id
          title
          description
          }
          }`
      })
      .valueChanges.subscribe(val => {
        console.log("Search Result : ", val.data.search_problems);
        this.sea = val.data.search_problems;
      });
  }
}
