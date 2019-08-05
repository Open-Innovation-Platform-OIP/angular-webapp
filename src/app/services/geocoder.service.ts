import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import { take } from "rxjs/operators";
import { Subscription, Observable } from "rxjs";

import gql from "graphql-tag";
declare var H: any;

@Injectable({
  providedIn: "root"
})
export class GeocoderService {
  public platform: any;
  public geocoder: any;
  public geocodingParameters: any;

  allLocationObservable: Observable<any>;

  allLocations: any = {};

  constructor(private apollo: Apollo) {
    this.platform = new H.service.Platform({
      app_id: "sug0MiMpvxIW4BhoGjcf",
      app_code: "GSl6bG5_ksXDw4sBTnhr_w",
      useHTTPS: true
    });
    this.geocodingParameters = {
      country: "IND"
    };
    this.geocoder = this.platform.getGeocodingService();
    this.getLocationsFromDB();
    // this.geocoder.geocode(this.geocodingParameters);
    // console.log(this.geocoder, "coder");
  }

  public getAddress(query2: string) {
    console.log(this.geocoder, "geo");

    return new Promise((resolve, reject) => {
      this.geocoder.geocode(
        { searchText: query2, country: "IND" },
        result => {
          if (result.Response.View.length > 0) {
            if (result.Response.View[0].Result.length > 0) {
              console.log(
                result.Response.View[0].Result,
                "result Response here maps"
              );
              resolve(result.Response.View[0].Result);
            } else {
              reject({ message: "no results found" });
            }
          } else {
            reject({ message: "no results found" });
          }
        },
        error => {
          reject(error);
        }
      );
    });
  }
  public error(error) {
    console.log("error", error);
  }

  getLocationsFromDB() {
    // this.all
    this.allLocationObservable = this.apollo.watchQuery<any>({
      query: gql`
        query {
          locations {
            id
            location_name
            lat
            long
          }
        }
      `,
      fetchPolicy: "network-only"
      // pollInterval: 500
    }).valueChanges;

    return new Promise((resolve, reject) => {
      // this.test.pipe(take(1)).subscribe(({ data }) => {
      //   if (data.tags.length > 0) {
      //     data.tags.map(tag => {
      //       this.allTags[tag.name] = tag;
      //       this.allTagsArray.push(tag.id);
      //     });
      //   }
      // });
      this.allLocationObservable.pipe(take(1)).subscribe(
        ({ data }) => {
          if (data.locations.length > 0) {
            data.locations.map(location => {
              this.allLocations[location.location_name] = location;
            });
          }
          resolve(data);
        },
        err => {
          console.log(err);
          reject(err);
        }
      );
    });
  }

  public addLocationsInDB(locations, tableName, tableId?) {
    let locationData = [];
    let test = `location_name`;
    console.log(locations, "locations in add geocoder");
    locationData = locations.map(location => {
      // location.lat = location.location.coordinates[0];
      // location.long = location.location.coordinates[1];
      return location;
    });
    const upsert_locations = gql`
      mutation upsert_locations($locations: [locations_insert_input!]!) {
        insert_locations(
          objects: $locations
          on_conflict: {
            constraint: locations_location_name_key
            update_columns: []
          }
        ) {
          affected_rows
          returning {
            id
          }
        }
      }
    `;

    this.apollo
      .mutate({
        mutation: upsert_locations,
        variables: {
          locations: locations
        }
      })
      .pipe(take(1))
      .subscribe(
        data => {
          console.log("owner adddition worked");
          this.getLocationsFromDB();

          let locationsToBeLinked = [];
          let trimmedTableName = tableName.slice(0, tableName.length - 1);

          if (data.data.insert_locations.returning) {
            data.data.insert_locations.returning.map(location => {
              locationsToBeLinked.push({
                location_id: location.id,
                [`${trimmedTableName}_id`]: tableId
              });
            });

            this.apollo
              .mutate({
                mutation: gql`
            mutation upsert_${trimmedTableName}_locations(
              $${trimmedTableName}_locations: [${trimmedTableName}_locations_insert_input!]!
            ) {
              insert_${trimmedTableName}_locations(
                objects: $${trimmedTableName}_locations
                on_conflict: {
                  constraint: ${trimmedTableName}_locations_pkey
                  update_columns: [location_id, ${trimmedTableName}_id]
                }
              ) {
                affected_rows
                returning {
                  location_id
                  ${trimmedTableName}_id
                }
              }
            }
          `,
                variables: {
                  [`${trimmedTableName}_locations`]: locationsToBeLinked
                }
              })
              .pipe(take(1))
              .subscribe(
                data => {
                  console.log("worked", data);
                },
                err => {
                  console.log(err, "couldn't add locations");
                }
              );

            console.log("worked", data);
          }
        },
        err => {
          console.log(err, "couldn't add locations");
          console.error(JSON.stringify(err));
        }
      );

    //   },
    //   error => {
    //     console.error(JSON.stringify(error));
    //   }
    // );
  }

  addRelationToLocations(tableId, locations, tableName) {
    let table = tableName.slice(0, tableName.length - 1);

    const upsert_locations = gql`
                mutation upsert_${table}_locations(
                  $${table}_locations: [${table}_locations_insert_input!]!
                ) {
                  insert_${table}_locations(
                    objects: $${table}_locations
                    on_conflict: {
                      constraint: ${table}_locations_pkey
                      update_columns: []
                    }
                  ) {
                    affected_rows
                    returning {
                      location_id
                      ${table}_id
                    }
                  }
                }
              `;
    this.apollo
      .mutate({
        mutation: upsert_locations,
        variables: {
          [`${table}_locations`]: Array.from(locations)
        }
      })
      .pipe(take(1))
      .subscribe(
        data => {},
        err => {
          console.error("Error uploading tags", err);
          console.error(JSON.stringify(err));
        }
      );
    // }

    // this.apollo
    //   .mutate<any>({
    //     mutation: gql`mutation insert_${table}_locations {
    //     insert_${table}_locations(
    //       objects: [
    //         { ${table}_id:"${tableId}",
    //           location_id:"${locationId}"
    //       },

    //       ]
    //     ) {
    //       returning {
    //         location_id

    //       }
    //     }
    //   }`
    //   })
    //   .pipe(take(1))
    //   .subscribe(
    //     data => {
    //       console.log(data, "location addition");
    //     },
    //     error => {
    //       console.log("error", error);
    //     }
    //   );
  }

  removeLocationRelation(locationId, tableId, tableName) {
    let trimmedTableName = tableName.slice(0, tableName.length - 1);
    this.apollo
      .mutate<any>({
        mutation: gql`
        mutation DeleteMutation($where: ${trimmedTableName}_locations_bool_exp!) {
          delete_${trimmedTableName}_locations(where: $where) {
            affected_rows
            returning {
              location_id
            }
          }
        }
      `,
        variables: {
          where: {
            location_id: {
              _eq: locationId
            },
            [`${trimmedTableName}_id`]: {
              _eq: tableId
            }
          }
        }
      })
      .pipe(take(1))
      .subscribe(
        ({ data }) => {
          console.log("worked", data);
          // location.reload();
          // location.reload();
          // this.router.navigateByUrl("/problems");

          return;
        },
        error => {
          console.log("Could delete due to " + error);
        }
      );
  }
}
