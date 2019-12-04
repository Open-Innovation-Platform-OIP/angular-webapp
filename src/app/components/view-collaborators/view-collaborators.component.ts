import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-view-collaborators',
  templateUrl: './view-collaborators.component.html',
  styleUrls: ['./view-collaborators.component.css']
})
export class ViewCollaboratorsComponent implements OnInit {
  @Input() problemData: any;
  public collaborators: any[] = [];
  constructor() { }

  ngOnInit() {
    if (this.problemData.collaborators) {
      this.collaborators = Object.keys(this.problemData.collaborators);
    }
  }
}
