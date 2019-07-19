import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxStarsComponent } from './box-stars.component';

describe('BoxStarsComponent', () => {
  let component: BoxStarsComponent;
  let fixture: ComponentFixture<BoxStarsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoxStarsComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoxStarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
