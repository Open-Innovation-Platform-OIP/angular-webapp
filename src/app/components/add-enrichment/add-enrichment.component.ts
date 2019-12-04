import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  OnChanges
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { first, finalize } from 'rxjs/operators';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import swal from 'sweetalert2';
import { EnrichmentService } from '../../services/enrichment.service';
import { FilesService } from '../../services/files.service';
import { AuthService } from '../../services/auth.service';
import { GeocoderService } from '../../services/geocoder.service';

@Component({
  selector: 'app-add-enrichment',
  templateUrl: './add-enrichment.component.html',
  styleUrls: ['./add-enrichment.component.css']
})
export class AddEnrichmentComponent implements OnChanges, OnInit {
  @Input() enrichmentData: any = {
    description: '',

    organization: '',
    resources_needed: '',
    image_urls: [],
    video_urls: [],
    impact: '',
    min_population: 0,
    max_population: 0,
    extent: '',
    beneficiary_attributes: ''
  };

  @Output() submitted = new EventEmitter();
  mode = 'Add';
  imgSrc: any = './assets/img/image_placeholder.jpg';

  sizes = [
    { value: 100, viewValue: '>100' },
    { value: 1000, viewValue: '>1000' },
    { value: 10000, viewValue: '>10000' },
    { value: 100000, viewValue: '>100,000' }
  ];

  public locations: Array<any>;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private imgUpload: FilesService,

    private apollo: Apollo,
    private enrichmentService: EnrichmentService,
    private auth: AuthService,
    private here: GeocoderService
  ) {}

  ngOnInit() {}

  ngOnChanges() {
    if (this.enrichmentData) {
      this.mode = 'Edit';

      this.enrichmentData = this.enrichmentData;
    }
  }
  public getAddress() {
    if (this.enrichmentData.location != '') {
      this.here.getAddress(this.enrichmentData.location).then(
        result => {
          this.locations = <Array<any>>result;
        },
        error => {
          console.error(error);
        }
      );
    }
  }
  public storeLocation(loc) {
    this.enrichmentData.location = loc.srcElement.innerText;
    this.locations = [];
  }
  sendEnrichDataToDB() {
    if (typeof this.enrichmentData.voted_by === 'string') {
      this.submitted.emit(this.enrichmentData);
    } else {
      this.enrichmentData.voted_by = this.enrichmentData.voted_by = JSON.stringify(
        this.enrichmentData.voted_by
      )
        .replace('[', '{')
        .replace(']', '}');
    }
    this.submitted.emit(this.enrichmentData);
  }
}
