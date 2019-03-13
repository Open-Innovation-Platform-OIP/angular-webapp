import { Injectable } from "@angular/core";
import * as Query from "./queries";
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

  async addProblemInDB(problemData: any, tagsArray) {
    console.log(problemData, "problem data");
    this.apollo
      .mutate<any>({
        mutation: Query.AddMutation,
        variables: {
          objects: [problemData]
        }
      })
      .subscribe(
        ({ data }) => {
          this.tagHandlerService.addTagsInDb(
            data.insert_problems.returning[0].id,
            tagsArray,
            "problems"
          );
        },
        error => {
          console.log("Could not add due to " + error);
        }
      );
  }

  getProblem(id: number) {
    return this.apollo.watchQuery<any>({
      query: gql`
        {
          problems(where: { id: { _eq: ${id} } }) {
            id
            title
          }
        }
      `
    }).valueChanges;
  }

  updateProblem(
    id: number,
    changedProblemData: any,
    updatedTagsArray,
    tagsArray
  ) {
    this.apollo
      .mutate<any>({
        mutation: Query.UpdateMutation,
        variables: {
          where: {
            id: {
              _eq: id
            }
          },
          set: {
            title: changedProblemData.title,
            description: changedProblemData.description,
            resources_needed: changedProblemData.resources_needed,
            location: changedProblemData.location,
            sectors: changedProblemData.sectors,
            image_urls: changedProblemData.image_urls,
            impact: changedProblemData.impact,
            extent: changedProblemData.extent,
            min_population: changedProblemData.min_population,

            beneficiary_attributes: changedProblemData.beneficiary_attributes,
            organization: changedProblemData.organization,
            video_urls: changedProblemData.video_urls
          }
        }
      })
      .subscribe(
        ({ data }) => {
          let tagsToBeAddedInDB = updatedTagsArray.map(updatedTag => {
            if (typeof updatedTag === "object") {
              return updatedTag;
            }
          });

          let tagsToBeRemoved = tagsArray.filter(tag => {
            let matched = false;
            updatedTagsArray.map(updatedTag => {
              if (typeof updatedTag !== "object") {
                if (tag.name === updatedTag) {
                  console.log(tag, updatedTag, "updatedtag and tag");
                  matched = true;
                }
              }
            });
            if (!matched) {
              console.log(tag, "to be rmoved tags");
              return tag;
            }
          });
          console.log(tagsToBeRemoved, "tags to be removed");

          console.log(tagsToBeAddedInDB, "test tag array");
          this.tagHandlerService.addTagsInDb(
            data.update_problems.returning[0].id,
            tagsToBeAddedInDB,
            "problems"
          );
          this.tagHandlerService.removeTagRelations(
            tagsToBeRemoved,
            "problems"
          );
          location.reload();
          this.router.navigateByUrl("/problems");
        },
        error => {
          console.log("Could not update due to " + error);
        }
      );
  }

  deleteProblem(id: number) {
    this.apollo
      .mutate<any>({
        mutation: Query.DeleteProblemMutation,
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
      })
      .subscribe(
        ({ data }) => {
          // location.reload();
          location.reload();
          this.router.navigateByUrl("/problems");

          return;
        },
        error => {
          console.log("Could delete due to " + error);
        }
      );
  }

  storeProblemWatchedBy(id: number, problemData: any) {
    this.apollo
      .mutate<any>({
        mutation: Query.UpdateMutation,
        variables: {
          where: {
            id: {
              _eq: id
            }
          },
          set: {
            watched_by: problemData.watched_by
          }
        }
      })
      .subscribe(
        ({ data }) => {
          // location.reload();
          // this.router.navigateByUrl("/problems");
        },
        error => {
          console.log("Could not add due to " + error);
        }
      );
  }
  storeProblemVotedBy(id: number, problemData: any) {
    this.apollo
      .mutate<any>({
        mutation: Query.UpdateMutation,
        variables: {
          where: {
            id: {
              _eq: id
            }
          },
          set: {
            voted_by: problemData.voted_by
          }
        }
      })
      .subscribe(
        ({ data }) => {
          // location.reload();
          // this.router.navigateByUrl("/problems");
        },
        error => {
          console.log("Could not add due to " + error);
        }
      );
  }

  getTagsOfAProblem(id) {
    let tags;
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
      .valueChanges.subscribe(result => {
        tags = result.data.problems[0].problem_tags.map(tagArray => {
          return tagArray.tag.name;
        });
        return tags;
      });
  }

  addDiscussions(discussionsData: any) {
    this.apollo
      .mutate<any>({
        mutation: Query.addDiscussions,
        variables: {
          objects: [discussionsData]
        }
      })
      .subscribe(discuss => {
        console.log("Services Comment Data : ", discuss);
      });
  }
}
// }
