import {
  Component,
  OnInit,
  Inject,
  ElementRef,
  ViewChild
} from '@angular/core';
import { Observable } from 'rxjs';
import { TagsService } from '../../services/tags.service';
import { map, startWith } from 'rxjs/operators';

import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';

import { COMMA, ENTER } from '@angular/cdk/keycodes';

import {
  FormControl,
  FormBuilder,
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

@Component({
  selector: 'app-domain-add-modal',
  templateUrl: './domain-add-modal.component.html',
  styleUrls: ['./domain-add-modal.component.css']
})
export class DomainAddModalComponent implements OnInit {
  @ViewChild('tagsInput') tagsInput: ElementRef<HTMLInputElement>;

  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  tagsCtrl = new FormControl();

  tags = [];
  addDomain: FormGroup;
  addOnBlur = true;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  filteredTags: Observable<any[]>;

  constructor(
    public dialogRef: MatDialogRef<DomainAddModalComponent>,
    public tagService: TagsService,

    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.filteredTags = this.tagsCtrl.valueChanges.pipe(
      startWith(null),
      map((sector: string | null) =>
        sector
          ? this._filter(sector)
          : Object.keys(this.tagService.allTags).slice()
      )
    );
  }

  ngOnInit() {}

  selectedTag(event: MatAutocompleteSelectedEvent): void {
    this.tags.push(event.option.value);
    this.tagsInput.nativeElement.value = '';
    this.tagsCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return Object.keys(this.tagService.allTags).filter(
      sector => sector.toLowerCase().indexOf(filterValue) === 0
    );
  }

  addTag(event) {}

  removeTag(owner) {
    const index = this.tags.indexOf(owner);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }
}
