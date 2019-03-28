import {
  Component, ViewChild, OnInit, Input,
  Output,
  EventEmitter
} from '@angular/core';
import { EmbedVideoService } from 'ngx-embed-video';

@Component({
  selector: 'app-display-modal',
  templateUrl: './display-modal.component.html',
  styleUrls: ['./display-modal.component.css']
})
export class DisplayModalComponent implements OnInit {
  @Input() source;
  iframe_html: any;

  constructor(
    private embedService: EmbedVideoService,
  ) { }

  ngOnInit() { }

  checkUrlIsImg(url) {
    var arr = ["jpeg", "jpg", "gif", "png"];
    var ext = url.substring(url.lastIndexOf(".") + 1);
    if (arr.indexOf(ext) > -1) {
      return true;
    } else {
      return false;
    }
  }
  checkUrlIsVideo(url) {
    var arr = ["mp4", "avi", "webm", "wmv"];
    var ext = url.substring(url.lastIndexOf(".") + 1);
    if (arr.indexOf(ext) > -1) {
      return true;
    } else {
      return false;
    }
  }

  checkUrlIsEmbeded(url) {
    var arr = ["youtube", "vimeo", "dailymotion"];
    // var ext = url.substring(url.lastIndexOf(".") + 1);
    let filtered = arr.filter((provider) => {
      return url.indexOf(provider) > -1;
    })

    if (filtered.length) {
      this.iframe_html = this.iframe_html = this.embedService.embed(url, { attr: { width: '100%', height: 500 } });
      return true;
    } else {
      return false;
    }
  }
}
