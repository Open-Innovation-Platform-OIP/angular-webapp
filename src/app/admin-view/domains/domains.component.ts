import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, AbstractControl } from '@angular/forms';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { take } from 'rxjs/operators';
import swal from 'sweetalert2';
import { TableData } from '../../md/md-table/md-table.component';
import { Subscription } from 'rxjs';
import { TagsService } from '../../services/tags.service';

import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormGroup
} from '@angular/forms';

import {
  MatAutocompleteSelectedEvent,
  MatChipInputEvent,
  MatAutocomplete
} from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-domains',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.css']
})
export class DomainsComponent implements OnInit {
  domainForm: FormGroup;
  sectorCtrl = new FormControl();
  filteredSectors: Observable<string[]>;
  sectors = [];
  allTags = {};
  public removable = true;

  public domainDataTable: TableData;
  public domainsQuery: QueryRef<any>;
  public domainsSubscription: Subscription;

  @ViewChild('sectorInput') sectorInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    private tagService: TagsService,
    private formBuilder: FormBuilder,
    private apollo: Apollo
  ) {
    this.domainForm = this.formBuilder.group({
      domainUrl: new FormControl('', [Validators.required]),

      colour: new FormControl('', [Validators.required])
    });

    this.getTagsForAdmin();
  }

  async getTagsForAdmin() {
    this.allTags = await this.tagService.getTagsFromDBForAdmin();

    this.filteredSectors = this.sectorCtrl.valueChanges.pipe(
      startWith(null),
      map((sector: string | null) =>
        sector ? this._filter(sector) : Object.keys(this.allTags).slice()
      )
    );
  }

  ngOnInit() {
    this.getDomains();
    const parser = document.createElement('a');
    parser.href = window.location.href;
    console.log(parser.hostname);
  }

  remove(sector: string): void {
    console.log(sector, this.sectors);
    const index = this.sectors.indexOf(sector);
    if (index >= 0) {
      this.sectors.splice(index, 1);
    }
  }

  add(event) {}

  selected(event: MatAutocompleteSelectedEvent): void {
    // //console.log(this.sectors, "test for sector");
    this.sectors.push(event.option.viewValue);
    this.sectorInput.nativeElement.value = '';
    this.sectorCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return Object.keys(this.allTags).filter(
      sector => sector.toLowerCase().indexOf(filterValue) === 0
    );
  }

  addDomain() {
    if (!this.domainForm.valid || !this.sectors.length) {
      return;
    }

    let domainUrl = this.domainForm.value.domainUrl;
    let colour = this.domainForm.value.colour;

    this.apollo
      .mutate({
        mutation: gql`
            mutation insert_domains {
              insert_domains(
                objects: [
                  {
                    
                    url: "${domainUrl}",
                    colour:"${colour}"
                  
                  }
                ]
              ) {
                affected_rows
                returning {
                  id
                  
                 
                }
              }
            }
          `
      })
      .pipe(take(1))
      .subscribe(
        data => {
          console.log(data, 'domain added');
          const domainId = data.data.insert_domains.returning[0].id;
          this.addSectorRelationship(domainId);
        },
        error => {
          console.error(error);
        }
      );
  }

  generateDomainsTable(domainData) {
    console.log(domainData, 'domain Data');
    const domainHeaderRow = ['Url', 'Colour', 'Sectors'];
    let domainDataRow = [];
    domainData.map(domain => {
      // console.log(user, "gnerate user table");
      console.log(domain['domain_tags'], 'domain tags');
      domainDataRow.push([
        domain['url'],
        domain['colour'],
        domain['domain_tags']
      ]);
    });
    this.domainDataTable = {
      headerRow: domainHeaderRow,
      dataRows: domainDataRow
    };
  }

  getDomains() {
    this.domainsQuery = this.apollo.watchQuery<any>({
      query: gql`
        query {
          domains {
            url
            colour
            id
            domain_tags {
              tag {
                name
              }
            }
          }
        }
      `,

      pollInterval: 2000,

      fetchPolicy: 'network-only'
    });

    this.domainsSubscription = this.domainsQuery.valueChanges.subscribe(
      ({ data }) => {
        // console.log(data, 'invited users data');
        if (data.domains.length > 0) {
          this.generateDomainsTable(data.domains);
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  addSectorRelationship(domainId) {
    const domainSectors = new Set();
    this.sectors.map(sector => {
      if (
        this.tagService.allTags[sector] &&
        this.tagService.allTags[sector].id
      ) {
        domainSectors.add({
          tag_id: this.tagService.allTags[sector].id,
          domain_id: domainId
        });
      }
    });

    const insert_domain_tags = gql`
      mutation upsert_domain_tags($domain_tags: [domain_tags_insert_input!]!) {
        insert_domain_tags(
          objects: $domain_tags
          on_conflict: {
            constraint: domain_tags_pkey
            update_columns: [tag_id, domain_id]
          }
        ) {
          affected_rows
          returning {
            tag_id
            domain_id
          }
        }
      }
    `;
    this.apollo
      .mutate({
        mutation: insert_domain_tags,
        variables: {
          domain_tags: Array.from(domainSectors)
        }
      })
      .pipe(take(1))
      .subscribe(
        data => {
          swal({
            type: 'success',
            title: `Domain Added`,
            timer: 1500,
            showConfirmButton: false
          }).catch(swal.noop);

          this.domainForm.reset();
          this.sectors = [];
        },
        error => {
          console.error(error);
        }
      );
  }
}
