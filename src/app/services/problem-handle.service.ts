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
  displayValidateProblem: boolean = false;
  displayEnrichForm: boolean = false;
  displayValidateCard: boolean = true;
  displayEnrichCard: boolean = true;

  enrichImgs: any[] = [];
  enrichVideos: any[] = [];
  imgSrcArr: any[] = [];
  problem: any = {
    organization: "",
    title: "",
    description: "",
    location: "",
    reported_by: [],

    owners: "{}",
    resources_needed: "",
    image_urls: [],
    video_urls: [],

    voted_by: [],
    watched_by: [],
    impact: "",
    extent: "",
    min_population: 0,

    beneficiary_attributes: "",
    notify_me: false,
    is_deleted: false
  };

  problemEnrichmentData: any = {
    [localStorage.getItem("userId")]: {
      description: "",
      location: "",
      sectors: {
        water: false,
        sanitation: false,
        health: false,
        agriculture: false,
        energy: false,
        environment: false,
        disabilities: false
      },
      resources_needed: "",
      img_urls: ""
    }
  };

  problemValidationData: any = {
    comment: "",
    files: [],
    validated_by: this.auth.currentUserValue.id
  };

  collaborate: any = {
    timestamp: Date.now(),
    key: "",
    value: false
  };

  constructor(
    private apollo: Apollo,
    private router: Router,
    private tagHandlerService: TagsService,
    private auth: AuthService
  ) {}

  async addProblemInDB(problemData: any, tagsArray) {
    this.problem.created_by = Number(this.auth.currentUserValue.id);
    // this.problem.created_at = new Date();
    // this.problem.modified_at = null;

    this.problem.notify_me = false;
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
          this.problem = {
            organization: "",
            title: "",
            description: "",
            location: "",
            reported_by: [],

            owners: "{}",
            resources_needed: "",
            image_urls: [],
            video_urls: [],

            voted_by: [],
            watched_by: [],
            impact: "",
            extent: "",
            min_population: 0,

            beneficiary_attributes: "",
            notify_me: false,
            is_deleted: false
          };

          this.tagHandlerService.addTagsInDb(
            data.insert_problems.returning[0].id,
            tagsArray,
            "problems"
          );

          // location.reload();
          // this.router.navigateByUrl("/problems");
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
      `,
      // pollInterval: 500
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
          // this.tagHandlerService.removeTagRelations(
          //   tagsToBeRemoved,
          //   "problems"
          // );
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

  // storeEnrichmentData(id: number, problemData: any) {
  //   return this.apollo.mutate<any>({
  //     mutation: Query.UpdateMutation,
  //     variables: {
  //       where: {
  //         id: {
  //           _eq: id
  //         }
  //       },
  //       set: {
  //         enrichment: problemData.enrichment
  //       }
  //     }
  //   });
  // }

  // updateEnrichmentData(id: number, problemData: any) {
  //   return this.apollo.mutate<any>({
  //     mutation: Query.UpdateMutation,
  //     variables: {
  //       where: {
  //         id: {
  //           _eq: id
  //         }
  //       },
  //       set: {
  //         enrichment: problemData.enrichment
  //       }
  //     }
  //   });
  // }

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
  storeEnrichVotedBy(id: number, enrichmentData: any) {
    console.log("test for vote enrich", id, enrichmentData);
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
            enrichment: enrichmentData
          }
        }
      })
      .subscribe(
        ({ data }) => {
          // location.reload();

          return;
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
        `,
        // pollInterval: 500
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

  addValidation() {
    console.log(this.problemValidationData, " problem validation data");
    this.problemValidationData.created_at = new Date();
    console.log(this.problemValidationData, "problem validation data");

    this.apollo
      .mutate<any>({
        mutation: Query.AddValidation,
        variables: {
          objects: [this.problemValidationData]
        }
      })
      .subscribe(
        data => {
          console.log(data);
          location.reload();
        },
        err => {
          console.log(err, "error");
        }
      );
  }

  updateValidation(validationData) {
    console.log(validationData, "edit validation data");
    validationData.edited_at = new Date();

    this.apollo
      .mutate<any>({
        mutation: Query.UpdateValidation,
        variables: {
          where: {
            validated_by: {
              _eq: validationData.validated_by
            },
            problem_id: {
              _eq: validationData.problem_id
            }
          },
          set: {
            comment: validationData.comment,
            files: validationData.files,
            edited_at: validationData.edited_at,
            agree: validationData.agree
          }
        }
      })
      .subscribe(
        data => {
          console.log(data);
          location.reload();
        },
        err => {
          console.log(err, "error");
        }
      );
  }

  deleteValidation(validationData) {
    console.log(validationData, "delete validation");
    // console.log(id, "ID");
    this.apollo
      .mutate<any>({
        mutation: Query.DeleteValidation,
        variables: {
          where: {
            validated_by: {
              _eq: validationData.validated_by
            },
            problem_id: {
              _eq: validationData.problem_id
            }
          }
        }
      })
      .subscribe(
        ({ data }) => {
          // location.reload();
          location.reload();
          // this.router.navigateByUrl("/problems");

          return;
        },
        error => {
          console.log("Could delete due to " + error);
        }
      );
  }

  addCollaborator(collaboratorData) {
    this.apollo
      .mutate<any>({
        mutation: Query.AddCollaborator,
        variables: {
          objects: [collaboratorData]
        }
      })
      .subscribe(
        data => {
          console.log(data);
          location.reload();
        },
        err => {
          console.log(err, "could not add collaborator due to");
        }
      );
  }

  updateCollaboration(collaboratorDataToBeUpdated, problemId, userId) {
    console.log(
      "collaborator data",
      collaboratorDataToBeUpdated,
      "problem id",
      problemId,
      "user id",
      userId
    );
    this.apollo
      .mutate<any>({
        mutation: Query.UpdateCollaboration,
        variables: {
          where: {
            user_id: {
              _eq: userId
            },
            problem_id: {
              _eq: problemId
            }
          },
          set: {
            intent: collaboratorDataToBeUpdated.intent,
            collaborate_as: collaboratorDataToBeUpdated.collaborate_as,
            edited_at: collaboratorDataToBeUpdated.edited_at
          }
        }
      })
      .subscribe(
        data => {
          console.log(data);
          location.reload();
        },
        err => {
          console.log(err, "error");
        }
      );
  }

  deleteCollaboration(collaboratorData) {
    this.apollo
      .mutate<any>({
        mutation: Query.DeleteCollaboration,
        variables: {
          where: {
            user_id: {
              _eq: collaboratorData.user_id
            },
            problem_id: {
              _eq: collaboratorData.problem_id
            }
          }
        }
      })
      .subscribe(
        ({ data }) => {
          // location.reload();
          location.reload();
          // this.router.navigateByUrl("/problems");

          return;
        },
        error => {
          console.log("Could delete due to " + error);
        }
      );
  }
}
// }
