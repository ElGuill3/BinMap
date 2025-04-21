import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PoiCardComponent } from './poi-card.component';

describe('PoiCardComponent', () => {
  let component: PoiCardComponent;
  let fixture: ComponentFixture<PoiCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PoiCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PoiCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
