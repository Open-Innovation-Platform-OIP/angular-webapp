import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy
} from '@angular/core';
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
import { of } from 'rxjs/observable/of';

@Component({
  selector: 'app-domains',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.css']
})
export class DomainsComponent implements OnInit, OnDestroy {
  domainForm: FormGroup;
  sectorCtrl = new FormControl();
  filteredSectors: Observable<string[]>;
  sectors = [];
  allTags = {};
  public removable = true;
  showDomainForm = false;
  editMode = false;
  domainId: any = null;

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

      colour: new FormControl('')
    });

    this.filteredSectors = of(['']);

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
  }

  remove(sector: string): void {
    const index = this.sectors.indexOf(sector);
    if (index >= 0) {
      this.sectors.splice(index, 1);
    }

    if (this.tagService.allTags[sector] && this.domainId) {
      this.apollo
        .mutate<any>({
          mutation: gql`
            mutation DeleteMutation($where: domain_tags_bool_exp!) {
              delete_domain_tags(where: $where) {
                affected_rows
                returning {
                  tag_id
                }
              }
            }
          `,
          variables: {
            where: {
              tag_id: {
                _eq: this.tagService.allTags[sector].id
              },
              domain_id: {
                _eq: this.domainId
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
            console.error('Could not delete due to ' + error);
          }
        );
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
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

    const domainUrl = this.domainForm.value.domainUrl;
    const colour = this.domainForm.value.colour;
    let domainDataObject = {};
    if (this.domainId) {
      domainDataObject = {
        url: domainUrl,
        colour,
        id: this.domainId
      };
    } else {
      domainDataObject = {
        url: domainUrl,
        colour
      };
    }

    this.apollo
      .mutate({
        mutation: gql`
          mutation upsert_domains($domains: [domains_insert_input!]!) {
            insert_domains(
              objects: $domains
              on_conflict: {
                constraint: domains_pkey
                update_columns: [url, colour]
              }
            ) {
              affected_rows
              returning {
                id
              }
            }
          }
        `,

        variables: {
          domains: domainDataObject
        }
      })
      .pipe(take(1))
      .subscribe(
        data => {
          const domainId = data.data.insert_domains.returning[0].id;
          this.addSectorRelationship(domainId);
          this.editMode = false;
          this.domainId = null;
          this.showDomainForm = false;
        },
        error => {
          console.error(error);
        }
      );
  }

  generateDomainsTable(domainData) {
    const domainHeaderRow = ['Url', 'Colour', 'Sectors'];
    const domainDataRow = [];
    domainData.map(domain => {
      domainDataRow.push([
        domain['url'],
        domain['colour'],
        domain['domain_tags'],
        domain['id']
      ]);
    });
    this.domainDataTable = {
      headerRow: domainHeaderRow,
      dataRows: domainDataRow
    };
  }

  editDomain(domainData) {
    this.editMode = true;

    this.showDomainForm = true;
    const url = domainData[0];
    const colour = domainData[1];
    if (domainData[2].length) {
      domainData[2].map(tags => {
        this.sectors.push(tags.tag.name);
      });
    }
    this.domainId = domainData[3];

    this.domainForm.patchValue({ domainUrl: url, colour: colour });
  }

  getDomains() {
    this.domainsQuery = this.apollo.watchQuery<any>({
      query: gql`
        query {
          domains {
            url
            colour
            id
            is_primary
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
        if (data.domains.length > 0) {
          this.generateDomainsTable(data.domains);
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  formButtonClicked() {
    this.showDomainForm = !this.showDomainForm;
    this.sectors = [];
    if (this.editMode) {
      this.domainForm.reset();

      this.editMode = false;
      this.domainId = null;
    }
  }

  addSectorRelationship(domainId) {
    const domainSectors = new Set();
    this.sectors.map(sector => {
      domainSectors.add({
        tag_id: this.tagService.adminDomainAdditionTags[sector].id,
        domain_id: domainId
      });
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

  ngOnDestroy() {
    this.domainsQuery.stopPolling();
    this.domainsSubscription.unsubscribe();
  }
}
