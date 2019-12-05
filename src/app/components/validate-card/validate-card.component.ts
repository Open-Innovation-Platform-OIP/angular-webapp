import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-validate-card',
  templateUrl: './validate-card.component.html',
  styleUrls: ['./validate-card.component.css']
})
export class ValidateCardComponent implements OnInit {
  @Input() validationData: any;
  @Output() clicked = new EventEmitter();
  @Input() index: number = 0;

  constructor(private auth: AuthService) {}

  ngOnInit() {}
  cardClicked() {
    this.clicked.emit(this.validationData);
  }
}
