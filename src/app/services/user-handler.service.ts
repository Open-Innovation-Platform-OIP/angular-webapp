import { Injectable } from "@angular/core";
import * as Query from "./queries";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Router, ActivatedRoute } from "@angular/router";
import { store } from "@angular/core/src/render3";
import { TagsService } from "./tags.service";

interface Persona {
  innovator: boolean;
  entrepreneur: boolean;
  expert: boolean;
  user: boolean;
  admin: boolean;
  funder: boolean;
  ngo: boolean;
  incubator: boolean;
  government: boolean;
}
@Injectable({
  providedIn: "root"
})
export class UserHandlerService {
  personas: Persona = {
    innovator: false,
    entrepreneur: false,
    expert: false,
    user: false,
    admin: false,
    funder: false,
    ngo: false,
    incubator: false,
    government: false
  };

  personaList: string[] = ['INNOVATOR', 'ENTREPRENEUR', 'EXPERT', 'USER', 'ADMIN', 'FUNDER', 'NGO', 'INCUBATOR', 'GOVERNMENT'];
  user: any = {
    name: "",
    organization: "",
    expertise: "",
    qualification: "",
    photo_url: {},
    phone_number: '',
    location: "",
    personas: []
  };

  constructor(
    private apollo: Apollo,
    private router: Router,
    private tagHandlerService: TagsService
  ) { }

  getUser(id: number) {
    return this.apollo.watchQuery<any>({
      query: gql`
        {
          users(where: { id: { _eq: ${id} } }) {
            id
            name
          }
        }
      `
    }).valueChanges;
  }

  addUserInDb(user: any) {
    // console.log(user, "user data on sign up");
    // console.log("check", user);
    this.apollo
      .mutate<any>({
        mutation: Query.AddUser,
        variables: {
          objects: [user]
        }
      })
      .subscribe(data => {
        // console.log("DATA", data);
        // this.userId = data.data.insert_users.returning[0].id;
        // console.log("ID ID", this.userId);
        // console.log("USER", user);
        this.router.navigateByUrl("/profiles");
      }, err => {
        console.error(err);
      });
  }

  updateUserInDb(
    id: number,
    changedUserData: any,
    tagsArray,
    updatedTagsArray?
  ) {
    console.log(changedUserData, "changed user data");
    this.apollo
      .mutate<any>({
        mutation: Query.UpdateUser,
        variables: {
          where: {
            id: {
              _eq: id
            }
          },
          set: {
            name: changedUserData.name,
            organization: changedUserData.organization,
            // expertise: changedUserData.expertise,
            // qualification: changedUserData.qualification,
            photo_url: changedUserData.photo_url,
            phone_number: changedUserData.phone_number,
            location: changedUserData.location,
            personas: changedUserData.personas
          }
        }
      })
      .subscribe(
        ({ data }) => {
          // console.log(data, "dat");
          // console.log(updatedTagsArray, "updated tags array");
          // console.log(tagsArray, "prev tags array");

          // if (!updatedTagsArray) {
          //   this.tagHandlerService.addTagsInDb(
          //     data.update_users.returning[0].id,
          //     tagsArray,
          //     "users"
          //   );
          // } else if (updatedTagsArray) {
          //   // console.log(updatedTagsArray, "updated tags");
          //   const tagsToBeAddedInDB = updatedTagsArray.map(updatedTag => {
          //     if (typeof updatedTag === "object") {
          //       return updatedTag;
          //     }
          //   });

          //   const tagsToBeRemoved = tagsArray.filter(tag => {
          //     let matched = false;
          //     updatedTagsArray.map(updatedTag => {
          //       if (typeof updatedTag !== "object") {
          //         if (tag.name === updatedTag) {
          //           console.log(tag, updatedTag, "updatedtag and tag");
          //           matched = true;
          //         }
          //       }
          //     });
          //     if (!matched) {
          //       return tag;
          //     }
          //   });
          //   // console.log("===", tagsToBeAddedInDB, 'tags to be added');

          //   console.log(tagsToBeAddedInDB, "test tag array");
          //   this.tagHandlerService.addTagsInDb(
          //     data.update_users.returning[0].id,
          //     tagsToBeAddedInDB,
          //     "users"
          //   );
          //   this.tagHandlerService.removeTagRelations(tagsToBeRemoved, "users");
          // }

          location.reload();
          this.router.navigateByUrl("/profiles");
        },
        error => {
          console.error("Could not update due to " + error);
        }
      );
  }
}
