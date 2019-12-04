import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { take } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';

import gql from 'graphql-tag';
declare var H: any;

@Injectable({
  providedIn: 'root'
})
export class GeocoderService {
  public platform: any;
  public geocoder: any;
  public geocodingParameters: any;

  allLocationObservable: Observable<any>;

  allLocations: any = {};

  constructor(private apollo: Apollo) {
    this.platform = new H.service.Platform({
      app_id: 'sug0MiMpvxIW4BhoGjcf',
      app_code: 'GSl6bG5_ksXDw4sBTnhr_w',
      useHTTPS: true
    });
    this.geocodingParameters = {
      country: 'IND'
    };
    this.geocoder = this.platform.getGeocodingService();
    this.getLocationsFromDB();
  }

  public getAddress(query2: string) {
    return new Promise((resolve, reject) => {
      this.geocoder.geocode(
        { searchText: query2, country: 'IND' },
        result => {
          if (result.Response.View.length > 0) {
            if (result.Response.View[0].Result.length > 0) {
              resolve(result.Response.View[0].Result);
            } else {
              reject({ message: 'no results found' });
            }
          } else {
            reject({ message: 'no results found' });
          }
        },
        error => {
          reject(error);
        }
      );
    });
  }
  public error(error) {
    console.error('error', error);
  }

  getLocationsFromDB() {
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
      fetchPolicy: 'network-only'
    }).valueChanges;

    return new Promise((resolve, reject) => {
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
          console.error(err);
          reject(err);
        }
      );
    });
  }

  public addLocationsInDB(locations, tableName, tableId?) {
    let locationData = [];
    const test = `location_name`;

    locationData = locations.map(location => {
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
          this.getLocationsFromDB();

          const locationsToBeLinked = [];
          const trimmedTableName = tableName.slice(0, tableName.length - 1);

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
                data => {},
                err => {
                  console.error(err, 'couldn\'t add locations');
                }
              );
          }
        },
        err => {
          console.error(JSON.stringify(err));
        }
      );
  }

  addRelationToLocations(tableId, locations, tableName) {
    const table = tableName.slice(0, tableName.length - 1);

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
          console.error('Error uploading tags', err);
          console.error(JSON.stringify(err));
        }
      );
  }

  removeLocationRelation(locationId, tableId, tableName) {
    const trimmedTableName = tableName.slice(0, tableName.length - 1);
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
          return;
        },
        error => {
          console.error('Could delete due to ' + error);
        }
      );
  }
}
