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
  @Input() index = 0;

  constructor(
    public filesService: FilesService,
    public authService: AuthService
  ) {}

  ngOnInit() {}
}
