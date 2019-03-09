import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-profile-card",
  templateUrl: "./profile-card.component.html",
  styleUrls: ["./profile-card.component.css"]
})
export class ProfileCardComponent implements OnInit {
  @Input() userData: any;
  constructor() { }

  ngOnInit() {
    // console.log(this.userData, "in card");
  }
}
