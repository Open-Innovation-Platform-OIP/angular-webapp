import { Injectable } from "@angular/core";

import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import swal from "sweetalert2";
import { Router, ActivatedRoute } from "@angular/router";
import { store } from "@angular/core/src/render3";
import { TagsService } from "./tags.service";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root"
})
export class ProblemService {
  enrichImgs: any[] = [];
  enrichVideos: any[] = [];
  imgSrcArr: any[] = [];

  constructor(
    private apollo: Apollo,
    private router: Router,
    private tagHandlerService: TagsService,
    private auth: AuthService
  ) {}

  deleteProblem(id: number) {
    return this.apollo.mutate<any>({
      mutation: gql`
        mutation updateMutation(
          $where: problems_bool_exp!
          $set: problems_set_input!
        ) {
          update_problems(where: $where, _set: $set) {
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
}
// }
