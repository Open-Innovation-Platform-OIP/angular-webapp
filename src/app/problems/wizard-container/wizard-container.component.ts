import { Component, OnInit, Input } from '@angular/core';
import { ErrorStateMatcher } from "@angular/material/core";

import {
  FormControl,
  FormBuilder,
  FormGroupDirective,
  NgForm,
  Validators,
  FormGroup
} from "@angular/forms";
// import { Content } from '@angular/compiler/src/render3/r3_ast';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-wizard-container',
  templateUrl: './wizard-container.component.html',
  styleUrls: ['./wizard-container.component.css']
})
export class WizardContainerComponent implements OnInit {
  @Input() content;

  constructor(
    private formBuilder: FormBuilder,

  ) { }

  ngOnInit() {
    console.log("checking the content: ", this.content);

  }

  displayFieldCss(form: FormGroup, field: string) {
    return {
      "has-error": this.isFieldValid(form, field),
      "has-feedback": this.isFieldValid(form, field)
    };
  }

  isFieldValid(form: FormGroup, field: string) {
    return !form.get(field).valid && form.get(field).touched;
  }
}
