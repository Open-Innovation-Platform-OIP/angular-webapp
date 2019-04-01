import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-validate-card",
  templateUrl: "./validate-card.component.html",
  styleUrls: ["./validate-card.component.css"]
})
export class ValidateCardComponent implements OnInit {
  @Input() validationData: any;
  @Output() clicked = new EventEmitter();

  constructor() { }

  ngOnInit() {
    // console.log("validate-card: ", this.validationData);
  }
  cardClicked() {
    this.clicked.emit(this.validationData);
  }
}
