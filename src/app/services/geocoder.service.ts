import { Injectable } from "@angular/core";
declare var H: any;

@Injectable({
  providedIn: "root"
})
export class GeocoderService {
  public platform: any;
  public geocoder: any;

  constructor() {
    this.platform = new H.service.Platform({
      app_id: "sug0MiMpvxIW4BhoGjcf",
      app_code: "GSl6bG5_ksXDw4sBTnhr_w",
      useHTTPS: true
    });
    this.geocoder = this.platform.getGeocodingService();
    console.log(this.geocoder, "coder");
  }

  public getAddress(query2: string) {
    console.log(this.geocoder, "geo");

    return new Promise((resolve, reject) => {
      this.geocoder.geocode(
        { searchText: query2 },
        result => {
          if (result.Response.View.length > 0) {
            if (result.Response.View[0].Result.length > 0) {
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
}
