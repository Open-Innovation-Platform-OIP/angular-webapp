import { Injectable } from '@angular/core';
import * as AWS from "aws-sdk";
import { digitalocean } from "../../environments/environment";
import { resolve } from 'dns';
import { reject } from 'q';
import { error } from 'util';

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

  // # Based on the example described: 
  // https://gist.github.com/sevastos/5804803

  async multiPartUpload(file_blob, key) {
    let startTime = new Date().getTime();
    let partSize: number = 5 * 1024 * 1024;
    let fileKey = key;
    let maxUploadTries = 3;
    let multipartMap = {
      Parts: []
    };
    let partNum = 0
    let spaces = this.s3;
    let numPartsLeft = Math.ceil(file_blob.length / partSize);
    let multiPartParams = {
      Bucket: bucket,
      Key: key,
      ACL: "public-read",
    }

    console.log("Creating multipart upload for:", fileKey);
    return new Promise((resolve, reject) => {
      spaces.createMultipartUpload(multiPartParams, async function (mpErr, multipart) {
        if (mpErr) {
          console.log('Error!', mpErr);
          reject(mpErr);
        }
        console.log("Got upload ID", multipart.UploadId);

        // Grab each partSize chunk and upload it as a part
        for (var rangeStart = 0; rangeStart < file_blob.length; rangeStart += partSize) {
          partNum++;
          var end = Math.min(rangeStart + partSize, file_blob.length),
            partParams = {
              Body: file_blob.slice(rangeStart, end),
              Bucket: bucket,
              Key: key,
              PartNumber: String(partNum),
              UploadId: multipart.UploadId
            };

          // Send a single part
          console.log('Uploading part: #', partParams.PartNumber, ', Range start:', rangeStart);
          resolve(uploadPart(spaces, multipart, partParams));
        }
      });
    })


    async function uploadPart(s3, multipart, partParams, tryNum?) {
      var tryNum = tryNum || 1;

      return new Promise((resolve, reject) => {
        s3.uploadPart(partParams, async function (multiErr, mData) {
          if (multiErr) {
            console.log('multiErr, upload part error:', multiErr);

            if (tryNum < maxUploadTries) {
              console.log('Retrying upload of part: #', partParams.PartNumber)
              uploadPart(s3, multipart, partParams, tryNum + 1);
            } else {
              console.log('Failed uploading part: #', partParams.PartNumber);
              reject(multiErr);
            }
            return;
          }

          multipartMap.Parts[this.request.params.PartNumber - 1] = {
            ETag: mData.ETag,
            PartNumber: Number(this.request.params.PartNumber)
          };

          console.log("Completed part", this.request.params.PartNumber);
          console.log('mData', mData);

          if (--numPartsLeft > 0) return; // complete only when all parts uploaded

          var doneParams = {
            Bucket: bucket,
            Key: fileKey,
            MultipartUpload: multipartMap,
            UploadId: multipart.UploadId
          };

          console.log("Completing upload...");
          // let finishedUpload = await 
          resolve(completeMultipartUpload(s3, doneParams));
          // complete = finishedUpload;
          // return finishedUpload;
        });
      })


    }

    async function completeMultipartUpload(s3, doneParams) {
      return new Promise((resolve, reject) => {
        s3.completeMultipartUpload(doneParams, function (err, data) {
          if (err) {
            console.log("An error occurred while completing the multipart upload");
            console.log(err);
            reject(err);
          } else {
            var delta: any = (new Date().getTime() - startTime) / 1000;
            console.log('Completed upload in', delta, 'seconds');
            console.log('Final upload data:', data);
            resolve(data);
          }
        });
      })

    }

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

/*
{
  Bucket: "sa-testing"
  ETag: "cdfb0525b4589190e9064e90951b1535-7"
  Key: "SampleVideo_640x360_30mb.mp4"
  Location: "sgp1.digitaloceanspaces.com/sa-testing/SampleVideo_640x360_30mb.mp4"
}
*/
