import { Component, OnInit, Input } from '@angular/core';
import { FilesService } from '../../services/files.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.css']
})
export class ProfileCardComponent implements OnInit {
  @Input() userData: any;

  constructor(
    private filesService: FilesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // console.log(this.userData, "in card");
  }
}
