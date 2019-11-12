import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DomainAddModalComponent } from './domain-add-modal.component';

describe('DomainAddModalComponent', () => {
  let component: DomainAddModalComponent;
  let fixture: ComponentFixture<DomainAddModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DomainAddModalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DomainAddModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
