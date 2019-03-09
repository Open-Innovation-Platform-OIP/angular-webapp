import { Injectable } from '@angular/core';
import * as AWS from "aws-sdk";
import { digitalocean } from "../../environments/environment";

var accessKeyId = digitalocean.accessKeyId;
var secretAccessKey = digitalocean.secretAccessKey;
var region = digitalocean.region;
var bucket = 'sa-testing';

var spacesEndpoint: any = new AWS.Endpoint(region + ".digitaloceanspaces.com");

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  s3: any;

  constructor() { 
    this.s3 = new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey
    });
  }

  uploadFile(blob, key) {
    // console.log("endpoint: ", spacesEndpoint);

    var params = {
      Bucket: bucket,
      Key: key,
      ACL: "public-read",
      Body: blob
    };

    return this.s3.upload(params, function (err, data) {
      if (!err) {
        // console.log(data); // successful response
        return data;
      } else {
        console.log(err); // an error occurred
        return false;
      }
    });
  }

  deleteFile(key) {
    var params = {
      Bucket: bucket,
      Key: key
    };

    // console.log("delete params: ", params);

    return this.s3.deleteObject(params);
  }
}
