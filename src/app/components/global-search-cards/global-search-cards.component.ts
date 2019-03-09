import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-global-search-cards',
  templateUrl: './global-search-cards.component.html',
  styleUrls: ['./global-search-cards.component.css']
})
export class GlobalSearchCardsComponent implements OnInit {
  @Input() problemData: any;
  @Input() userData: any;

  constructor() { }

  ngOnInit() {
  }

}
