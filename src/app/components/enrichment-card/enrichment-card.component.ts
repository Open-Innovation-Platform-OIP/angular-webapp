import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FilesService } from '../../services/files.service';

@Component({
  selector: 'app-enrichment-card',
  templateUrl: './enrichment-card.component.html',
  styleUrls: ['./enrichment-card.component.css']
})
export class EnrichmentCardComponent implements OnInit {
  @Input() enrichmentData: any;
  @Input() index = 0;
  @Output() clicked = new EventEmitter();
  numberOfVotes: any = 0;
  voters = new Set();

  constructor(private auth: AuthService, private filesService: FilesService) {}

  ngOnInit() {
    this.enrichmentData.enrichment_voters.map(voter => {
      this.voters.add(voter.user_id);
    });
  }
  cardClicked() {
    this.clicked.emit(this.enrichmentData);
  }

  checkUrlIsImg(url) {
    const arr = ['jpeg', 'jpg', 'gif', 'png'];
    const ext = url.substring(url.lastIndexOf('.') + 1);
    if (arr.indexOf(ext) > -1) {
      return true;
    } else {
      return false;
    }
  }
}
