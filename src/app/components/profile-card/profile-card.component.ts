import { Component, OnInit, Input } from "@angular/core";
import { FilesService } from "../../services/files.service";

@Component({
  selector: "app-profile-card",
  templateUrl: "./profile-card.component.html",
  styleUrls: ["./profile-card.component.css"]
})
export class ProfileCardComponent implements OnInit {
  @Input() userData: any;

  constructor(private filesService: FilesService) {}

  ngOnInit() {
    // console.log(this.userData, "in card");
  }
}
