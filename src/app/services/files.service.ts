import { Injectable } from '@angular/core';

import { fileUploadVariables } from '../../environments/environment';

import { resolve } from 'dns';
import { reject } from 'q';
import { error } from 'util';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HTTPHeader } from 'aws-sdk/clients/wafregional';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  fileinput_id: string;
  authToken: string = '';
  fileAccessUrl: string = '';

  constructor(private http: HttpClient) {
    this.fileAccessUrl = fileUploadVariables.accessUrl + '/';
  }

  showSpinner() {
    let btn_id = this.fileinput_id;

    let comment_btn = <HTMLInputElement>document.getElementById(btn_id);
    let spinner = document.getElementById('loader');
    let upoadBtn = <HTMLInputElement>document.getElementById('file_input_btn');
    if (spinner && upoadBtn) {
      spinner.style.display = 'block';
      upoadBtn.disabled = true;
    }
    if (comment_btn) {
      comment_btn.disabled = true;
    }
    document.body.style.setProperty('cursor', 'wait', 'important');
  }

  hideSpinner() {
    let btn_id = this.fileinput_id;

    let comment_btn = <HTMLInputElement>document.getElementById(btn_id);
    let spinner = document.getElementById('loader');
    let uploadBtn = <HTMLInputElement>document.getElementById('file_input_btn');
    if (spinner && uploadBtn) {
      spinner.style.display = 'none';
      uploadBtn.disabled = false;
    }
    if (comment_btn) {
      comment_btn.disabled = false;
    }
    document.body.style.cursor = 'default';
  }

  deleteFile(fileName) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      this.authToken = currentUser['token'];
    }
    let headers = new HttpHeaders({
      Authorization: this.authToken
    });
    let options = { headers: headers };
    var params = {
      file_data: `${fileUploadVariables.bucketName}/${fileName}`
    };

    return this.http.post(
      `${fileUploadVariables.deleteEndpoint}`,
      params,
      options
    );
  }

  fileUpload(file, type) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      this.authToken = currentUser['token'];
    }
    let headers = new HttpHeaders({
      Authorization: this.authToken
    });
    let options = { headers: headers };
    this.showSpinner();
    const fileName = file.name.substring(0, file.name.lastIndexOf('.'));
    const fileExt = file.name.substring(
      file.name.lastIndexOf('.') + 1,
      file.name.length
    );
    const uniqueFileName = (
      fileName +
      '-' +
      Date.now() +
      '.' +
      fileExt
    ).toLowerCase();

    return new Promise((resolve, reject) => {
      this.http
        .post(
          fileUploadVariables.UploadUrlEndpoint,
          { file_data: `${fileUploadVariables.bucketName}/${uniqueFileName}` },
          options
        )
        .subscribe(
          result => {
            if (result && result['presigned_url']) {
              const httpOptions = {
                headers: new HttpHeaders({
                  'Content-Type': `${type}`
                })
              };

              this.http
                .put(result['presigned_url'], file, httpOptions)
                .subscribe(
                  result => {
                    let returnObject = {
                      fileEndpoint: `${fileUploadVariables.bucketName}/${uniqueFileName}`,
                      type: type,
                      key: uniqueFileName
                    };
                    resolve(returnObject);
                    this.hideSpinner();
                  },
                  error => {
                    reject(error);
                  }
                );
            }
          },
          error => {
            reject(error);
          }
        );
    });
  }
}
