import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormGroup
} from '@angular/forms';
import { FormBuilder, AbstractControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { UsersService } from '../../services/users.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import {
  MatAutocompleteSelectedEvent,
  MatChipInputEvent,
  MatAutocomplete
} from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-invite-user',
  templateUrl: './invite-user.component.html',
  styleUrls: ['./invite-user.component.css']
})
export class InviteUserComponent implements OnInit {
  userInviteForm: FormGroup;
  orgName: string = 'sd';
  @ViewChild('orgsInput') orgsInput: ElementRef<HTMLInputElement>;

  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  orgsCtrl = new FormControl();

  orgs = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredOrgs: Observable<any[]>;

  constructor(
    private formBuilder: FormBuilder,
    public usersService: UsersService
  ) {
    this.userInviteForm = this.formBuilder.group({
      email: new FormControl('', [Validators.email]),

      name: new FormControl('', [Validators.required])
    });
    this.filteredOrgs = this.orgsCtrl.valueChanges.pipe(
      startWith(null),
      map((org: string | null) =>
        org ? this._filter(org) : Object.keys(this.usersService.allOrgs).slice()
      )
    );
  }

  ngOnInit() {
    this.userInviteForm = this.formBuilder.group({
      email: new FormControl('', [Validators.email]),

      name: new FormControl('', [Validators.required])
    });
  }

  selectedOrg(event: MatAutocompleteSelectedEvent): void {
    this.orgs.push(event.option.value);
    this.orgsInput.nativeElement.value = '';
    this.orgsCtrl.setValue(null);
    this.orgName = event.option.value;
    console.log(event, 'event', this.orgName);

    // this.announcement(`Added ${event.option.value.value}`);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return Object.keys(this.usersService.allOrgs).filter(
      org => org.toLowerCase().indexOf(filterValue) === 0
    );
  }

  removeTag(owner) {
    const index = this.orgs.indexOf(owner);
    if (index >= 0) {
      this.orgs.splice(index, 1);
      // this.removed.emit(owner);
      // this.announcement(`Removed ${owner.value || owner.name}`);
    }
  }

  inviteUser() {
    if (!this.userInviteForm.valid) {
      return;
    }
    console.log('worked', this.userInviteForm);

    // if (this.userInvite.valid) {
    //   console.log('worked');
    // }
  }
}
